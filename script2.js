var actionSocket = new Rete.Socket('Action');
var dataSocket = new Rete.Socket('Data');

var eventHandlers = {
    list: [],
    clear() {
        this.list.forEach(handler => {
            document.removeEventListener('keydown', handler);
        });
        this.list = [];
    },
    add(name, handler) {
        document.addEventListener(name, handler, false);
        this.list.push(handler);
    }
};



class MessageControl extends Rete.Control {

    constructor(emitter, msg) {
        super();
        this.emitter = emitter;
        this.template = '<input :value="msg" @input="change($event)"/>';

        this.scope = {
            msg,
            change: this.change.bind(this)
        };
    }

    change(e) {
        this.scope.value = +e.target.value;
        this.update();
    }

    update() {
        this.putData('msg', this.scope.value)
        this.emitter.trigger('process');
        this._alight.scan();
    }

    mounted() {
        this.scope.value = this.getData('msg') || 0;
        this.update();
    }

    setValue(val) {
        this.scope.value = val;
        this._alight.scan()
    }
}

// class KeydownComponent extends Rete.Component {
  
//   constructor(){
//     super('Keydown event');
//     this.task = {
//       outputs: {act: 'option',  key: 'output'},
//       init(task, node){
//         eventHandlers.add('keydown', function (e) {
//           task.run(e.keyCode);
//           task.reset();
//         });
//       }
//     }
//   }
  
//   builder(node) {
//     node.addOutput(new Rete.Output('act', '', actionSocket));
//     node.addOutput(new Rete.Output('act', '', actionSocket));
//     node.addOutput(new Rete.Output('key', 'Key code', dataSocket));
//   }
  
//   worker(node, inputs, data) {
//     console.log('Keydown event', node.id, data);
//     return {key: data}
//   }
// }

class RootComponent extends Rete.Component {
  
    constructor(){
      super('Root');
      this.task = {
        outputs: {then:'option', else:'option'}
      }
    }
    
    builder(node) {

        var ctrl = new MessageControl(this.editor, node.data.msg);
  
      node
        .addControl(ctrl)
        //.addInput(new Rete.Input('act','', actionSocket))
        //.addInput(new Rete.Input('key', 'Key code', dataSocket))
        .addOutput(new Rete.Output('then', '', actionSocket))
        .addOutput(new Rete.Output('else', '', actionSocket));
    }
  
    worker(node, inputs, outputs) {
      if (inputs['key'][0] == 13) 
        this.closed = ['else'];
      else 
        this.closed = ['then'];

        alert(node.data.msg);
  
      console.log('Print', node.id, inputs);
    }
  }

class EnterPressComponent extends Rete.Component {
  
  constructor(){
    super('Operator');
    this.task = {
      outputs: {then:'option', else:'option'}
    }
  }
  
  builder(node) {

    var ctrl = new MessageControl(this.editor, node.data.msg);

    node
      .addControl(ctrl)
      .addInput(new Rete.Input('act','', actionSocket))
      //.addInput(new Rete.Input('key', 'Key code', dataSocket))
      .addOutput(new Rete.Output('then', '', actionSocket))
      .addOutput(new Rete.Output('else', '', actionSocket));
  }

  worker(node, inputs, outputs) {
    if (inputs['key'][0] == 13) 
      this.closed = ['else'];
    else 
      this.closed = ['then'];

      alert(node.data.msg);

    console.log('Print', node.id, inputs);
  }
}

class AlertComponent extends Rete.Component {
  
  constructor() {
    super('Operand');
    this.task = {
      outputs: {}
    }
  }

  builder(node) {
    var ctrl = new MessageControl(this.editor, node.data.msg);
    
    node
      .addControl(ctrl)
      .addInput(new Rete.Input('act', '', actionSocket));
  }

  worker(node, inputs) {
    console.log('Operand', node.id, node.data);
    alert(node.data.msg);
 }
}

var components = [new RootComponent, new EnterPressComponent, new AlertComponent];
var container = document.querySelector('#rete')


var editor = new Rete.NodeEditor('tasksample@0.1.0', container,);
editor.use(AlightRenderPlugin);
editor.use(ConnectionPlugin);
editor.use(ContextMenuPlugin);
editor.use(TaskPlugin);


var engine = new Rete.Engine('tasksample@0.1.0');

components.map(c => {
  editor.register(c);
  engine.register(c);
});

editor.on('connectioncreate connectionremove nodecreate noderemove', ()=>{
  if(editor.silent) return;

  eventHandlers.clear();
  compile();
});




async function compile() {
    await engine.abort();
    await engine.process(editor.toJSON());
}



var data = {
    'id': 'tasksample@0.1.0',
    'nodes': {
        '2': {
            'id': 2,
            'data':  {
                'msg': 'Enter!'
            },
            'group': null,
            'inputs': {},
            'outputs': {
                'act': {
                    'connections': [
                        {
                            'node': 3,
                            'input': 'act'
                        }
                    ]
                },
                // 'key': {
                //     'connections': [
                //         {
                //             'node': 3,
                //             'input': 'key'
                //         }
                //     ]
                // }
            },
            'position': [
                114, 133
            ],
            'name': 'Root'
        },
    //     '3': {
    //         'id': 3,
    //         'data':  {
    //             'msg': 'Enter!'
    //         },
    //         'group': null,
    //         'inputs': {
    //             'act':{
    //                 'connections': [
    //                     {
    //                         'node': 2,
    //                         'output': 'act'
    //                     }
    //                 ]
    //             }, 
    //             // 'key': {
    //             //     'connections': [
    //             //         {
    //             //             'node': 2,
    //             //             'output': 'key'
    //             //         }
    //             //     ]
    //             // }
    //         },
    //         'outputs': {
    //             'then':{
    //                 'connections': [
    //                     {
    //                         'node': 10,
    //                         'input': 'act'
    //                     }
    //                 ]
    //             }, 
    //             'else': {
    //                 'connections': [
    //                     {
    //                         'node': 11,
    //                         'input': 'act'
    //                     }
    //                 ]
    //             }
    //         },
    //         'position': [
    //             443, 112
    //         ],
    //         'name': 'Operator'
    //     },
    //     '10': {
    //         'id': 10,
    //         'data': {
    //             'msg': 'Enter!'
    //         },
    //         'group': null,
    //         'inputs': {
    //             'act': {
    //                 'connections': [
    //                     {
    //                         'node': 3,
    //                         'output': 'then'
    //                     }
    //                 ]
    //             }
    //         },
    //         'outputs': [],
    //         'position': [
    //             773, 106
    //         ],
    //         'name': 'Operand'
    //     },
    //     '11': {
    //         'id': 11,
    //         'data': {
    //             'msg': 'Another key pressed'
    //         },
    //         'group': null,
    //         'inputs': {
    //             'act': {
    //                 'connections': [
    //                     {
    //                         'node': 3,
    //                         'output': 'else'
    //                     }
    //                 ]
    //             }
    //         },
    //         'outputs': [],
    //         'position': [
    //             766, 292
    //         ],
    //         'name': 'Operand'
    //     }
    },
    'groups': {}
}

editor.fromJSON(data).then(() => {
    editor.view.resize();
    compile();
});

