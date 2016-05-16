!(function(w,d){
    'use strict';

    function _el(name){
        return d.createElement(name);
    }

    function c_node(data,clb,selected,id,state){
        var li = _el('li')
            ,d = _el('div')
            ,r = _el('span')
            ,l = _el('span')
            ,container = _el('div')
            ,c = _el('input')
            ,b = _el('a');

        r.className = ' node-text';
        container.className = 'pull-right';

        c.type = 'checkbox';
        c.name = 'checked[]';
        c.value = id;
        c.onchange = selected;
        c.className = ' hidden ';

        b.href = 'javascript:void(0)';
        b.innerHTML = '<span class="glyphicon glyphicon-chevron-down"></span><span class="glyphicon glyphicon-chevron-right"></span>';
        b.setAttribute('aria-expanded',state);
        b.className = state ? ' hidden expanded ':' hidden collapsed ';
        b.onclick = clb;

        li.className = ' dd-item ';
        d.className = ' dd-handle ';
        r.innerHTML = data.parent === undefined ? '<b>'+data.label+'</b>':data.label;

        container.appendChild(c);
        l.appendChild(b);
        d.appendChild(l);
        d.appendChild(r);
        d.appendChild(container);
        li.appendChild(d);
        return [li,b,c,container];
    };

    function gebi(id){
        return d.getElementById(id);
    }

    function log(){
        var t = Array.prototype.slice.call(arguments);
        console.info.call(console, '%c TreeJS Debug : ','background: #ff508e; color: #fff;padding:5px', t.join(' '));
    }

    function extend() {
      var a = arguments, target = a[0] || {}, i = 1, l = a.length, deep = false, options;

      if (typeof target === 'boolean') {
        deep = target;
        target = a[1] || {};
        i = 2;
      }

      if (typeof target !== 'object' && (typeof target !== "function")) target = {};

      for (; i < l; ++i) {
        if ((options = a[i]) != null) {
          for (var name in options) {
            var src = target[name], copy = options[name];

            if (target === copy) continue;

            if (deep && copy && typeof copy === 'object' && !copy.nodeType) {
              target[name] = extend(deep, src || (copy.length != null ? [] : {}), copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }

      return target;
    }


    /*function extend(obj, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) obj[key] = src[key];
        }
        return obj;
    }*/

    function walk_top(n){
        var tmp = n;
        while (tmp.parents.length){
            tmp.parents[0].childNodes.push(n);
            tmp = tmp.parents[0];
        } 
    }

    function unid(){
        return 'tree-component-xxx-yxxx-x'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    var i = function(){ this.component = component; }
        ,tree = function(){ }
        ,component = function(o){ this.init(o); }
        ,uneque = {}
        ,defaults = {
            debug:!0,
            components:[],
            data:[],
            checkbox: !1,
            container: document.getElementsByTagName('body')[0]
        };

    tree.prototype.init = function(obj,options){
        
        var node;

        this.childNodes = [];
        this.parents = [];
        this.data = obj;
        this.depth = 1;
        this.main_list = _el('ol');
        this.expanded = options.collapsed !== undefined ? !options.collapsed:!1;
        this.selected = !1;
        this.checkbox_callback = typeof options.onChecked === 'function'?options.onChecked:function(){};
        this.deleteBtnCallback = typeof options.deleteButtonClick === 'function'?options.deleteButtonClick:function(){};
        
        this.main_list.className = (this.expanded || this.data.parent === undefined) ? ' dd-list breadcrumb ':' dd-list breadcrumb hidden ';


        this.data.id = uneque[this.data.id] = this.data.self = unid();

        if(this.data.parent !== undefined && !!this.data.parent){
            this.data.parent = uneque[this.data.parent] !== undefined ? uneque[this.data.parent]:this.data.parent; 
        }

        node = c_node(obj,this.onClick.bind(this),this.onSelect.bind(this),this._id(),this.expanded);

        node[0].id = obj.id;

        this.main_list.appendChild(node[0]);

        this.btn = node[1];
        this.used = node[2];
        this.components = node[3];

        if(options.checkbox){
            this.used.classList.remove('hidden');
        }

        return this;
    };

    tree.prototype.initialize_conponents = function(arr){
        for(var i=0,l=arr.length;i<l;i++){
            if( arr[i] instanceof component ){
                var copy = extend({},arr[i]);
                copy.create(this);
                this.components.appendChild( copy.container );
            }
        }
    };

    tree.prototype.onDeleteHandler = function(e){
        this.deleteBtnCallback(e,this);
    };

    tree.prototype.hide = function(){
        this.main_list.classList.add('hidden');
    };

    tree.prototype.show = function(){
        this.main_list.classList.remove('hidden');
    };

    tree.prototype.onClick = function(e,state){


        this.btn.classList[!this.expanded ? 'add' : 'remove']('expanded');
        this.btn.classList[this.expanded ? 'add' : 'remove']('collapsed');

        this.expanded = state !== undefined ? state : !this.expanded;        

        if(!e){
            this.el().classList[this.expanded ? 'add' : 'remove']('hidden');
            return;
        }

        for (var i = this.childNodes.length - 1; i >= 0; i--) {
            this.childNodes[i].onClick(!1,!this.expanded);
        };
    };

    tree.prototype.pushParent = function(parents){
        this.parents.push(parents);
    };

    tree.prototype.onSelect = function(e,state) {
        this.selected = state !== undefined ? state : !this.selected;
        this.used.checked = this.selected;

        if(!e) return !1;

        var hashes = [this];
        for(var i=0,l=this.childNodes.length;i<l;i++){
            this.childNodes[i].onSelect(null,(state !== undefined ? state : this.selected));
            hashes.push(this);
        } this.checkbox_callback(this.selected,hashes); this.checkParents();
    };

    tree.prototype.checkParents = function(){
        var node =  this.parents;
        while(node.length) {
            for(var j=0,ln=node.length;j<ln;j++) {
                for (var i = 0, count=!1, l = node[j].childNodes.length; i < l; i++) {
                    if (node[j].childNodes[i].selected) {
                        ++count;
                    }
                }
                if(i===count){ node[j].onSelect(null, !0); }else{ node[j].onSelect(null, !1); }
            } node = node[--j].parents;
        }

    };

    tree.prototype.addChild = function(clone){
        this.btn.classList.remove('hidden');
        clone.pushParent(this);
        walk_top(clone);
        this.main_list.childNodes[0].appendChild(clone.el());
    };

    tree.prototype.id = function(){
        return this.data.self;
    };

    tree.prototype._id = function(){
        return this.data.id;
    };

    tree.prototype.isSelected = function(){
        return this.selected;
    };

    tree.prototype.top = function(){
        return this.data.parent;
    };

    tree.prototype.el = function(){
        return this.main_list;
    };

    i.prototype.init = function(options){

        options = extend(defaults,options);

        log('called with options',options);

        this.data = options.data;
        this.collection = {};
        this.iterate = 0;
        this.roots = {};

        for(var item in this.data){
            if(this.data[item].parent === undefined || parseInt(this.data[item].parent) === 0 ){
                var root = _el('div'),
                    tmp = new tree().init(this.data[item],options);
                    tmp.initialize_conponents(options.components);
                root.className = ' col-md-4 mrg10T ';
                root.appendChild(tmp.el());
                this.collection[tmp.id()] = tmp;
                this.roots[tmp.id()] = tmp;
                container.appendChild(root);
                delete this.data[item];
            }
        }

        while(++this.iterate < 2){
            for (var item in this.data) {
                if (this.data[item].parent !== undefined) {
                    var tmp = new tree().init(this.data[item],options);
                    tmp.initialize_conponents(options.components);
                    if (this.collection[tmp.top()]) {
                        this.collection[tmp.id()] = tmp;
                        this.collection[tmp.top()].addChild(tmp);
                        delete this.data[item];
                    }
                }
            } if(!Object.keys(this.data).length){ break; }
        } console.log(this.iterate,this.data); this.data = options.data;

        if(options.check !== undefined && options.check.length){
            this.selectItems(options.check);
        }

        for(var r in this.roots){
            set_depth(this.roots[r]);
        }
    };

    function set_depth(node){
        for(var i=0,ln=node.childNodes.length; i<ln; i++){
            node.childNodes[i].depth++;
            set_depth(node.childNodes[i]);
        }
    }

    i.prototype.selectItems = function(arr){
        for(var i=0,l=arr.length;i<l;i++){
            if (this.collection[arr[i]]) {
                this.collection[arr[i]].onSelect(~[],!0);
            }
        }
    };

    i.prototype.unselectItems = function(arr){
        for(var i=0,l=arr.length;i<l;i++){
            if (this.collection[arr[i]]) {
                this.collection[arr[i]].onSelect(~[],!1);
            }
        }
    };

    i.prototype.getSelected = function( method ){
        var result = [], m = method === undefined ? '_id':'id';
        for(var item in this.collection){
            if (this.collection[item].isSelected()) {
                result.push(this.collection[item][m]());
            }
        } return result;
    };

    component.prototype.init = function(options) {
        
        this.options =  extend({
            created: function(){},
            click: function(){}
        }, options );
        
        return this;
    };

    component.prototype.create = function( node ) {
        delete this.init;
        this.tree = node;
        this.container = create_component( this.options, this.clickHandler );
        this.container.onclick = function(e){ this.clickHandler(e); }.bind(this);
        this.options.created(this,node);
    };

    component.prototype.clickHandler = function(e){
        this.options.click(e,this);
    }

    function create_component(o){
        var btn = _el('a')
            ,wrap = _el('div');
            
            wrap.className = ' pull-right ';

            wrap.id = unid();

            btn.className = ' btn btn-small btn-xs ';
            btn.innerHTML = o.html;

            wrap.appendChild( btn );
        
        return wrap;
    }

    w.t_view = i;
})(window,document);