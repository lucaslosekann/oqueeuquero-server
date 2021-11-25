const pool = require("../../utils/db").pool;
const { createOne, getOne, deleteList } = require("./list.validation")
const { protect } = require('../../utils/auth');

exports.getOne = async (req,res) => {
  const { edit } = req.query;
  if(edit){
    protect(req,res,()=>main(req,res))
  }else{
    main(req,res)
  }
  async function main(res,res){
    try{
      const { ref } = req.params;
  
  
      const [lists] = await pool.promise().query(
        `SELECT name, id, private, showPix, showAddress, code, user_id FROM lists WHERE ref = ?`, [ref]) 
  
      if(lists.length <= 0){
        return res.status(404).send({message:"Invalid reference", code: 90})
      }else{
        var [{name, private, showPix, showAddress, code, id, user_id}] = lists
      }
      if(edit){
        if(user_id !== req.user.id){
          return res.status(401).send({message: "User not allowed", code:92})
        }
      }
      if(private){
        if(req.query.c !== code){
          return res.status(401).send({message:"Private", code: 91})
        }
      }
      const [list] = await pool.promise().query(`
        SELECT description, (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id',id,'link',link)
          ) FROM links WHERE list_item_id = item.id
        ) as links, checked, item.id as id FROM list_items as item 
        INNER JOIN lists as list ON list.id = item.list_id
        WHERE ref = ?`,
      [ ref, ref ])
      res.send({list, name, id});
    }catch (e) {
      console.error(e)
      if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
      return res.status(500).send({message: "Internal server error", code: 51})
    }
  }

}

exports.createOne = async (req,res) => {
  try{
    const [ listArray ] = await pool.promise().query(`SELECT id FROM lists WHERE user_id = ?`,[req.user.id])
    if(req.user.role !== 'premium' && listArray.length >= 4){
      return res.send({message: "Lists limit exceeded", code: 301})
    }
    const { ref, name, showPix = false, showAddress = false, private = false} = await createOne.validateAsync(req.body)
    const code = (Math.random().toString(36)+'00000000000000000').slice(2, 7).toUpperCase();
    if(req.user.role !== 'premium'){
      if(showPix || showAddress){
        return res.status(401).send();
      }
    }
    const [[list]] = await pool.promise().query(`SELECT id FROM lists WHERE ref = ?`,
    [ref])
    if(list){
      return res.status(400).send({code:17, message: "Ref already exists"})
    }
    const [[_,[returnedList]]] = await pool.promise().query(`INSERT INTO lists (name, ref, showPix, showAddress, private, code, user_id) VALUES(?,?,?,?,?,?,?);
    SELECT id, name, ref, created_at FROM lists WHERE ref = ?`,
    [name, ref, showPix, showAddress, private, code, req.user.id, ref])

    if(private){
      res.send({...returnedList, accessCode:code});
    }else{
      res.send(returnedList);
    }
    
  }catch (e) {
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }
}

exports.getMany = async (req, res) => {
  try{
    const [lists] = await pool.promise().query(`
    SELECT id, name, ref, created_at, code, private FROM lists WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id])
    res.send(lists);
  }catch (e) {
    return res.status(500).send({message: "Internal server error", code: 51})
  }
}

exports.deleteList = async (req, res) => {
  try{
    // if(req.user.role !== 'premium'){
    //   return res.send({message: "Premium functionality", code: 300})
    // }
    const { id } = await deleteList.validateAsync(req.body);
    const [{affectedRows}] = await pool.promise().query(`DELETE FROM lists WHERE id = ? AND user_id = ?`,[id, req.user.id])
    if(affectedRows <= 0){
      res.send({message:"Invalid id or user", deleted: false})
    }else{
      res.send({message:"Item deleted", deleted: true})
    }
  }catch(e){
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }
}