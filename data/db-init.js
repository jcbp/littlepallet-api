const dbConn = require('../src/db-conn');

(async() => {
  const db = await dbConn.open();

  await db.collection('lists').deleteMany();
  await db.collection('lists').insertMany([
    {
      'name': 'Tasks',
      'fieldLastIndex': 6,
      'filtersLastIndex': 0,
      'filters': [],
      'fields': [
        {
          'type': 'boolean',
          'name': 'Done',
          'width': 90,
          '_id': 0
        },
        {
          'type': 'traffic-light',
          'name': 'Status',
          'width': 90,
          '_id': 6
        },
        {
          'type': 'text',
          'name': 'Title',
          '_id': 2 
        },
        {
          'type': 'date',
          'name': 'Date',
          '_id': 1 
        },
        {
          'type': 'long-text',
          'name': 'Description',
          '_id': 3 
        },
        {
          'type': 'options',
          'options': ['Pepe', 'Coco'],
          'name': 'Assign to',
          '_id': 4 
        },
        {
          'type': 'number',
          'name': 'Money',
          '_id': 5 
        }
      ],
      'items': [
        {
          '_id': '0',
          '0': false,
          '1': '2019-11-25',
          '2': 'Test task',
          '3': 'This is a\nlooong descriptioooon',
          '4': 'Coco',
          '5': '02:45:00'
        },
        {
          '_id': '1',
          '0': true,
          '1': '2019-11-28',
          '2': 'Other task',
          '3': 'Lorem Ipsum',
          '4': 'Pepe',
          '5': '03:45:00'
        },
        {
          '_id': '2',
          '0': true,
          '1': '2020-01-08',
          '2': 'SAsasasa',
          '3': 'Lorem Ipsum, dolor sit amet',
          '4': 'Coco',
          '5': '08:40:20'
        }
      ]
    }
  ]);
  dbConn.close();
})();