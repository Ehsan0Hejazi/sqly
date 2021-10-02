import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';
import Sqlite from 'react-native-sqlite-storage';
Sqlite.enablePromise();

const db = Sqlite.openDatabase(
  { name: 'ArzDB', location: 'default' },
  success => { },
  error => { }
);

export default function App() {
  useEffect(() => {
    createTable();
  }, []);

  const createTable = async () => {
    await db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "
        + "Coins "
        + "("
        + "id INTEGER PRIMARY KEY, "
        + "name TEXT, "
        + "usd INTEGER"
        + ");"
      );
    });
  }

  const getDataAndSave = async () => {
    try {
      const res = await axios.get('http://185.31.175.8:3000/coin');
      const coins = res.data.coins;

      const b = coins.map(elem =>  {
        return {
          id: elem.id || 0,
          name: elem.name ? elem.name.replace("'", "''") : "" ,
          usd: elem.usd || 0
        }
      });

      const c = b.map(elem => `(${elem.id},'${elem.name}',${elem.usd})`);

      const d = c.join(', ');

      const Query = "INSERT INTO Coins(id, name, usd) VALUES " + d + " ON CONFLICT(id) DO UPDATE SET name=excluded.name, usd=excluded.usd;"
      
      console.log('insert start')
      await db.transaction((tx) => {
        tx.executeSql(
          Query,
          [],
          (tx, result) => {
            // console.log('tx: ', tx);
            // console.log('result', result)
          },
          err => console.log(err)
        )
      });
      console.log('insert done')
    } catch (err) {
      console.log(err);
    }
  }

  const get = async () => {
    try {
      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM Coins', [], (tx, results) => {
            console.log("Query completed");
      
            var len = results.rows.length;
            for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);
              console.log(row);
            }
          });
      });
    } catch (err) {
      console.log(err);
    }
  }

  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Button title="fetch and insert" onPress={getDataAndSave} />
    <Button title="get coins list" onPress={get} />
  </View>
}