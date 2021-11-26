const pool = require("../../utils/db").pool;
const { createOne, check, deleteItem, uncheck } = require("./listItem.validation")


exports.createOne = async (req,res) => {
  try{
    const { description, links, listId } = await createOne.validateAsync(req.body)
    const [[list]] = await pool.promise().query(`SELECT user_id FROM lists WHERE id = ?`,
    [listId])
    if(!list){
      return res.status(400).send({code:15, message: "Must provide a valid list id"})
    }
    if(list.user_id != req.user.id){
      return res.status(401).send({code:31, message: "Must provide a valid list id"})
    }
    


    const insertId = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if(err) return reject(err);
        connection.beginTransaction(function (err) {
          if (err) {
            //Transaction Error (Rollback and release connection)
            connection.rollback(function () {
              connection.release();
              reject(err);
            });
          } else {
            connection.query(
              "INSERT INTO list_items (description, list_id) VALUES(?,?)",
              [
                description, listId
              ],
              function (err, listItem) {
                if (err) {
                  //Transaction Error (Rollback and release connection)
                  connection.rollback(function () {
                    connection.release();
                    reject(err);
                  });
                } else {
                  if(!links){
                    connection.commit(function (err) {
                      if (err) {
                        //Transaction Error (Rollback and release connection)
                        connection.rollback(function () {
                          connection.release();
                          reject(err);
                        });
                      } else {
                        //Transaction Succes (Release connection and retrieve data)
                        connection.release();
                        resolve(listItem);
                      }
                    });
                  }else{
                    connection.query(
                      `INSERT INTO links (link, list_item_id) VALUES ?`,
                      [
                        links.map(link=>[ link, listItem.insertId])
                      ],
                      function (err, results) {
                        if (err) {
                          //Transaction Error (Rollback and release connection)
                          connection.rollback(function () {
                            connection.release();
                            reject(err);
                          });
                        } else {
                          connection.commit(function (err) {
                            if (err) {
                              //Transaction Error (Rollback and release connection)
                              connection.rollback(function () {
                                connection.release();
                                reject(err);
                              });
                            } else {
                              //Transaction Succes (Release connection and retrieve data)
                              connection.release();
                              resolve(listItem);
                            }
                          });
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        });
      });
    });
    res.send({id: insertId.insertId});
  }catch (e) {
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }
}

exports.check = async (req, res) => {
  try{
    const { listRef, listItemId } = await check.validateAsync(req.body);

    const [[ listItem ]] = await pool.promise().query(`
      SELECT list_items.id from list_items
      INNER JOIN lists ON lists.id = list_items.list_id
      WHERE list_items.id = ? AND lists.ref = ?;
    `, [listItemId, listRef])
    if(!listItem){
      return res.status(401).send({message: 'Please provide a valid combination of ref and list id'});
    }

    const [{affectedRows}] = await pool.promise().query(`
      UPDATE list_items SET checked = 1 WHERE id = ?
    `, listItemId)

    if(affectedRows === 1){
      res.send({id: listItemId});
    }else{
      res.status(500).send({message: "Internal server error", code: 51});
    }
    
  }catch (e) {
    console.log(e)
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }
}

exports.uncheck = async (req, res) => {
  try{
    const { id } = await uncheck.validateAsync(req.body);

    const [[{affectedRows},[{checked}]]] = await pool.promise().query(`
      UPDATE list_items SET checked = NOT checked WHERE id = ? AND (SELECT user_id FROM lists WHERE id = list_items.list_id) = ?;
      SELECT checked from list_items WHERE id = ?
    `, [id, req.user.id, id])
    if(affectedRows === 1){
      res.send({message:"Item updated", updated: true, checked})
    }else{
      res.send({message:"Invalid id or user", updated: false})
    }
  }catch (e) {
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }
}

exports.deleteItem = async (req, res) => {
  try{
    const { id } = await deleteItem.validateAsync(req.body);
    const [{affectedRows}] = await pool.promise().query(`DELETE FROM list_items WHERE id = ? AND (SELECT user_id FROM lists WHERE id = list_items.list_id) = ?`,[id, req.user.id])
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

exports.getOne = async (req, res) => {
  try{
    const { id } = req.params;
    if(user_id !== req.user.id){
      return res.status(401).send({message: "User not allowed", code:92})
    }

    const [list] = await pool.promise().query(`
    SELECT description, (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT('id',id,'link',link)
      ) FROM links WHERE list_item_id = item.id
    ) as links, checked, item.id as id FROM list_items as item where id = ?`,
    [ id ])
    res.send({list});
  }catch (e) {
    console.error(e)
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }
}