const dbConn = require('../src/db-conn');

(async() => {
  const db = await dbConn.open();

  await db.collection('lists').deleteMany();
  
  await db.collection('lists').insertMany([
    {"name":"Tareas","isTemplate":false,"fieldLastIndex":10,"filterLastIndex":18,"conditions":[],"filters":[{"name":"Pendientes","_id":1,"action":"include","field":"5","when":"equal to","value":"Pendiente"},{"name":"En progreso","_id":2,"action":"include","field":"5","when":"equal to","value":"En progreso"},{"name":"Terminadas","action":"include","_id":3,"field":"5","when":"equal to","value":"Terminada"}],"fields":[{"name":"Prioridad","type":"traffic-light","visible":"table-view","section":"none","_id":10},{"name":"Tarea","type":"multiline-text","visible":"table-view","importance":"title","_id":1,"defaultValue":"Nueva","help":"Nombre de la tarea","section":"title","width":"xxl"},{"name":"Descripción","type":"multiline-text","visible":"no","importance":"summary","_id":3,"section":"none","width":"15%"},{"name":"Estado","type":"options","visible":"table-view","section":"none","_id":5,"options":["Pendiente","En progreso","Pausada","Terminada"],"defaultValue":"Pendiente"},{"name":"Tipo","type":"options","visible":"table-view","section":"none","_id":9,"options":["Feature","Improvement","Bug"],"defaultValue":"Feature"}],"items":[{"1":"Papelera","2":"Pendiente","3":"Permitir recuperar un elemento borrado","4":"Pendiente","5":"Pendiente","9":"Feature","10":"yellow","_id":"0"},{"1":"Mover campos a una posición anterior o posterior","2":"Pendiente","4":"Pendiente","5":"Pendiente","8":"0","_id":"1"},{"1":"Establecer ancho de columnas en base a un listado simple","3":"xxs, xs, sm, md, lg, xl, xxl","5":"Terminada","8":"4","10":"red","_id":"2"},{"1":"Listas hijas","3":"Permitir asociar otras listas como listas hijas","5":"Terminada","_id":"3"},{"1":"Cambiar el editor de texto enriquecido","3":"https://github.com/scrumpy/tiptap\nhttps://tiptap.scrumpy.io/","5":"Pendiente","_id":"4"},{"1":"Agregar control para texto multilinea (texto plano)","5":"Pendiente","_id":"5"},{"1":"Clonar listas","5":"Terminada","_id":"6"},{"1":"Crear configuración de lista","5":"Terminada","_id":"7"},{"1":"Incluir nombre en la vista de item","5":"Terminada","_id":"8"},{"1":"Agregar vista de item como dialogo modal","5":"Pendiente","_id":"9"},{"1":"Crear filtros rápidos","5":"Terminada","8":"5ef6c341fce9e424db367f62","_id":"10"},{"1":"Sumar campos de listas hijas para mostrar en Overview","5":"Terminada","8":"5ef6c341fce9e424db367f62","_id":"11"},{"1":"Agregar background","5":"Pausada","8":"5ef6c341fce9e424db367f62","9":"Improvement","_id":"12"},{"1":"Poder agregar nuevos items en Card view","5":"Pendiente","8":"5ef6c341fce9e424db367f62","9":"Feature","10":"red","_id":"13"},{"1":"Agregar Board view","5":"Pendiente","8":"5ef6c341fce9e424db367f62","_id":"14"},{"1":"Más opciones en los filtros rápidos","3":"Mostrar un menú \"más opciones\" donde se puede guardar el filtro o hacer modificaciones en bulk sobre el resultado filtrado","5":"Pendiente","8":"5ef6c341fce9e424db367f62","9":"Improvement","_id":"15"},{"1":"Agregar control color picker con una paleta reducida","5":"Pendiente","8":"5ef6c341fce9e424db367f62","9":"Feature","_id":"16"},{"1":"Agregar control para prioridades (alta, media, baja)","5":"Pendiente","8":"5ef6c341fce9e424db367f62","9":"Feature","_id":"17"},{"1":"Borrar listas","5":"Terminada","8":"5ef6c341fce9e424db367f62","9":"Feature","_id":"18"},{"1":"Permitir agregar una descripción a las listas","5":"Pendiente","8":"5ef6c341fce9e424db367f62","9":"Feature","10":"yellow","_id":"19"},{"1":"Corregir filtros guardados","5":"Terminada","8":"5ef6c341fce9e424db367f62","9":"Bug","10":"red","_id":"20"},{"1":"Filtro se rompe cuando se pasa de un tipo \"options\" a otro tipo \"options\"","5":"Terminada","8":"5ef6c341fce9e424db367f62","9":"Bug","10":"red","_id":"21"},{"1":"Agregar un menú que permita mostrar \"quick filter\" o \"sort by\" (botón \"...\")","5":"Pendiente","8":"5ef6c341fce9e424db367f62","9":"Feature","10":"yellow","_id":"22"},{"1":"Clonar listas asociadas al clonar una lista","5":"Terminada","8":"5ef6c341fce9e424db367f62","9":"Feature","10":"yellow","_id":"23"},{"1":"Usar una lista para cargar las opciones de un campo de tipo \"options\"","5":"Pendiente","9":"Improvement","10":"yellow","_id":"24"},{"1":"Rediseñar la home","5":"Pendiente","9":"Improvement","_id":"25"}],"childLists":[{"0":"5ef6c341fce9e424db367f62","_id":"0"}]}
  ]);

  // await db.collection('lists').insertMany([
  //   {
  //     'name': 'Tasks',
  //     'fieldLastIndex': 6,
  //     'filtersLastIndex': 0,
  //     'filters': [],
  //     'fields': [
  //       {
  //         'type': 'boolean',
  //         'name': 'Done',
  //         'width': 90,
  //         '_id': 0
  //       },
  //       {
  //         'type': 'traffic-light',
  //         'name': 'Status',
  //         'width': 90,
  //         '_id': 6
  //       },
  //       {
  //         'type': 'text',
  //         'name': 'Title',
  //         '_id': 2 
  //       },
  //       {
  //         'type': 'date',
  //         'name': 'Date',
  //         '_id': 1 
  //       },
  //       {
  //         'type': 'long-text',
  //         'name': 'Description',
  //         '_id': 3 
  //       },
  //       {
  //         'type': 'options',
  //         'options': ['Pepe', 'Coco'],
  //         'name': 'Assign to',
  //         '_id': 4 
  //       },
  //       {
  //         'type': 'number',
  //         'name': 'Money',
  //         '_id': 5 
  //       }
  //     ],
  //     'items': [
  //       {
  //         '_id': '0',
  //         '0': false,
  //         '1': '2019-11-25',
  //         '2': 'Test task',
  //         '3': 'This is a\nlooong descriptioooon',
  //         '4': 'Coco',
  //         '5': '02:45:00'
  //       },
  //       {
  //         '_id': '1',
  //         '0': true,
  //         '1': '2019-11-28',
  //         '2': 'Other task',
  //         '3': 'Lorem Ipsum',
  //         '4': 'Pepe',
  //         '5': '03:45:00'
  //       },
  //       {
  //         '_id': '2',
  //         '0': true,
  //         '1': '2020-01-08',
  //         '2': 'SAsasasa',
  //         '3': 'Lorem Ipsum, dolor sit amet',
  //         '4': 'Coco',
  //         '5': '08:40:20'
  //       }
  //     ]
  //   }
  // ]);
  dbConn.close();
})();