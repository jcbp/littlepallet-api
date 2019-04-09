const dbConn = require('../src/db-conn');

(async () => {
  const db = await dbConn.open();
  await db.collection('lists').insertMany([
    {
        "name": "Tasks",
        "fields": [
            {
                "type": "boolean",
                "name": "Done"
            },
            {
                "type": "text",
                "name": "Title"
            },
            {
                "type": "long-text",
                "name": "Description"
            },
            {
                "type": "options",
                "options": ["Pepe", "Coco"],
                "name": "Assign to"
            },
            {
                "type": "time",
                "name": "Time tracking"
            }
        ],
        "items": [
            [
                false,
                "Test task",
                "This is a\nlooong descriptioooon",
                "Coco",
                "02 45 00"
            ]
        ]
    }
  ]);
  dbConn.close();
})();