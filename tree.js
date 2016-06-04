!(function(w,d){
    'use strict';

    var i = function(){ this.component = component; }
        ,tree = function(){ }
        ,component = function(o){ this.init(o); }
        ,uneque = {}
        ,defaults = {
            debug:!0,
            components:[],
            data:[],
            checkbox: !1,
            container: d.body
        };

    tree.prototype.init = function(obj,options){
        
        this.collectionDrop = options.collectionDrop;
        this.data = obj;
        this.parents = [];
        this.components = [];
        this.childNodes = [];
        this.depth = 1;
        this.expanded = options.collapsed !== undefined ? !options.collapsed:!1;
        this.selected = !1;
        this.checkbox_callback = typeof options.onChecked === 'function'?options.onChecked:function(){};
        
        this.data.id = uneque[this.data.id] = extra.unid('tree-item');

        if(this.data.parent !== undefined && !!this.data.parent){
            this.data.parent = uneque[this.data.parent] !== undefined ? uneque[this.data.parent]:this.data.parent; 
        }

        this.dom = extra.c_node(obj,this.onClick.bind(this),this.onSelect.bind(this),this.id(),this.expanded);

        this.dom.container.id = obj.id;

        this.dom.root.className = (this.expanded || this.data.parent === undefined) ? ' dd-list breadcrumb ':' dd-list breadcrumb hidden ';
        this.dom.root.appendChild(this.dom.container);

        if(options.checkbox){
            this.dom.checkBox.classList.remove('hidden');
        }

        return this;
    };

    tree.prototype.setName = function(text) {
        this.dom.nodeText.innerHTML = text;
    };

    tree.prototype.remove_component = function(component) {
        var index = this.components.indexOf(component);
        if( index !== -1 ){
            this.dom.components.removeChild(component.container);
            this.components.splice(index,1);
        }
    };

    tree.prototype.initialize_conponents = function(arr){
        for(var i=0,l=arr.length;i<l;i++){
            if( arr[i] instanceof component ){
                var copy = extra.extend({},arr[i]);
                copy.create(this);
                this.components.push(copy);
                this.dom.components.appendChild( copy.container );
            }
        }
    };

    tree.prototype.isRoot = function() {
        return this.data.parent === undefined;
    };

    tree.prototype.remove = function(){
        
        var arr = this.childNodes;
            arr.push(this);

        this.collectionDrop( arr );
        if(this.isRoot()){
            if(this.dom.root.parentNode){
                this.dom.root.parentNode.parentNode.removeChild(this.dom.root.parentNode); return !0;
            } return !1;
        }else{
            this.parents[0].removeChild(this);
            this.dom.root.parentNode.removeChild(this.dom.root);
            return !0;
        }

    };

    tree.prototype.onClick = function(e,state){

        this.expanded = state !== undefined ? state : !this.expanded;        

        if(!e){
            this.el().classList[this.expanded ? 'add' : 'remove']('hidden');
            return;
        }

        this.dom.expander.classList[this.expanded ? 'add' : 'remove']('expanded');
        this.dom.expander.classList[!this.expanded ? 'add' : 'remove']('collapsed');
        this.dom.expander.setAttribute('aria-expanded',!this.expanded ? 'false' : 'true');


        for (var i = this.childNodes.length - 1; i >= 0; i--) {
            if((this.childNodes[i].depth - this.depth) === 1){
                this.childNodes[i].onClick(!1,!this.expanded);
            }
        };
    };

    tree.prototype.onSelect = function(e,state) {

        if(state !== undefined && (this.selected === state)) { return !1; }

        this.selected = state !== undefined ? state : !this.selected;
        this.dom.checkBox.checked = this.selected;

        if(!e) return !1;

        var hashes = [this];
        for(var i=0,l=this.childNodes.length;i<l;i++){
            this.childNodes[i].onSelect(null,(state !== undefined ? state : this.selected));
            hashes.push(this);
        } hashes = this.checkParents(hashes); this.checkbox_callback(this.selected,hashes); 
    };

    tree.prototype.checkParents = function( arr ){
        var node =  this.parents, prevState = !1;
        while(node.length) {
            for(var j=0,ln=node.length;j<ln;j++) {
                for (var i = 0, count=!1, l = node[j].childNodes.length; i < l; i++) {
                    if (node[j].childNodes[i].selected) {
                        ++count;
                    }
                } 
                prevState = node[j].selected;
                if(i===count){ node[j].onSelect(null, !0); }else{ node[j].onSelect(null, !1); }
                node[j].selected !== prevState ? ( arr.push( node[j] ) ):null;
            } node = node[--j].parents;
        } return arr;

    };

    tree.prototype.removeChild = function(remove){
        
        var p = this, rm = remove.childNodes, r_l = 0;
        r_l = rm.length;
        while(p){

            for(var i=0,ln=p.childNodes.length;i<ln;i++){
                for(var j=0;j<r_l;j++){
                    if(rm[j] === p.childNodes[i]){
                        p.childNodes.splice(i,1); break; 
                    }
                }
            }

            if(p.childNodes.length === 0){
                p.dom.expander.classList.add('hidden');
            }
            p = p.parents[0];
        }

    };

    tree.prototype.pushParent = function(parents){
        this.parents.push(parents);
    };

    tree.prototype.addChild = function(clone){
        this.dom.expander.classList.remove('hidden');
        var p = this.parents[0];
        clone.pushParent(this);
        while(p){
            clone.pushParent(p);
            p = p.parents[0];
        }
        clone.depth = clone.parents.length + 1;
        extra.append_child(clone);
        this.dom.root.childNodes[0].appendChild(clone.el());
    };

    tree.prototype.id = function(){
        return this.data.id;
    };

    tree.prototype.isSelected = function(){
        return this.selected;
    };

    tree.prototype.top = function(){
        return this.data.parent;
    };

    tree.prototype.el = function(){
        return this.dom.root;
    };


    /**************-------------------root-------------------**************/


    i.prototype.init = function(options){

        options = extra.extend(defaults,options);

        extra.log('called with options',options);

        options.collectionDrop = this.collectionDrop.bind(this);
        this.options = options;
        this.collection = {};

        this.addItems(this.options.data);

        console.log(this.options.data);

        if(options.check !== undefined && options.check.length){
            this.selectItems(options.check);
        }

        return this;
    };

    i.prototype.addItems = function(data) {
        this.collection = addItems(
                                    this.options,
                                    data,
                                    this.collection
                                  );
    };

    function addItems(options,data,coll){
        
        var collection = coll
            ,iterate=0
            ,check = [];

        for(var item in data){
            if(data[item].parent === undefined || parseInt(data[item].parent) === 0 ){
                var root = extra._el('div'),
                    tmp = new tree().init(data[item],options);
                    tmp.initialize_conponents(options.components);
                root.className = options.rootClass ? options.rootClass : ' col-md-4 mrg10T ';
                root.appendChild(tmp.el());
                collection[tmp.id()] = tmp;
                container.appendChild(root);
                data[item].checked && check.push(tmp);
                delete data[item];
            }
        }

        while(++iterate < 2){
            for (var item in data) {
                if (data[item].parent !== undefined) {
                    var tmp = new tree().init(data[item],options);
                    tmp.initialize_conponents(options.components);
                    if (collection[tmp.top()]) {
                        collection[tmp.id()] = tmp;
                        collection[tmp.top()].addChild(tmp);
                        data[item].checked && check.push(tmp);
                        delete data[item];
                    }
                }
            } if(!Object.keys(data).length){ break; }
        }

        for(var item in check){
            check[item].onSelect({},!0);
        }

        return collection;
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
    
    i.prototype.collectionDrop = function(items) {
        
        if(items === undefined || items === null || items.length === 0){
            return;
        }

        if(items instanceof tree){
            items = [items];
        }

        for(var u in this.collection){
            if(items.indexOf(this.collection[u]) !== -1){
                delete this.collection[u];
            }
        }
    };


    /**************-------------------component-------------------**************/


    component.prototype.init = function(options) {
        
        this.options =  extra.extend({
            created: function(){},
            click: function(){}
        }, options );
        
        return this;
    };

    component.prototype.create = function( node ) {
        delete this.init;
        this.tree = node;
        this.container = extra.create_component( this.options, this.clickHandler );
        this.container.onclick = function(e){ this.clickHandler(e); }.bind(this);
        this.options.created( node );
    };

    component.prototype.remove = function(){
        return this.tree.remove_component(this);
    };

    component.prototype.clickHandler = function(e){
        this.options.click(e,this);
    }

    w.t_view = i;
})(window,document);