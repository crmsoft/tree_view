!(function(w,d){
    'use strict';

    function _el(name){
        return d.createElement(name);
    }

    function c_node(txt,clb,selected,id,dCallback){
        var li = _el('li')
            ,d = _el('div')
            ,r = _el('span')
            ,l = _el('span')
            ,e = _el('div')
            ,c = _el('input')
            ,del = _el('span')
            ,b = _el('a');

        r.className = ' node-text';
        e.className = 'pull-right';

        c.type = 'checkbox';
        c.name = 'checked[]';
        c.value = id;
        c.onchange = selected;
        c.className = ' hidden ';

        del.innerHTML = 'x';
        del.className = ' hidden btn-danger btn btn-xs btn-small ';
        del.onclick = dCallback;

        b.href = 'javascript:void(0)';
        b.className = ' hidden expanded ';
        b.onclick = clb;


        li.className = ' dd-item ';
        d.className = ' dd-handle ';
        r.innerHTML = txt;


        e.appendChild(c);
        e.appendChild(del);
        l.appendChild(b);
        d.appendChild(l);
        d.appendChild(r);
        d.appendChild(e);
        li.appendChild(d);
        return [li,b,c,del];
    };

    function gebi(id){
        return d.getElementById(id);
    }

    var i = function(){}
        ,three = function(){};

    three.prototype.init = function(obj,options){

        var node;

        this.childNodes = [];
        this.parents = [];
        this.data = obj;
        this.main_list = _el('ol');
        this.expanded = this.selected = !1;
        this.checkbox_callback = typeof options.checked === 'function'?options.checked:function(){};
        this.deleteBtnCallback = typeof options.deleteButtonClick === 'function'?options.deleteButtonClick:function(){};

        this.main_list.className = ' dd-list ';

        if(obj.parent === "0"){ obj.title = "<b>"+obj.title+"</b>"; }

        node = c_node(obj.title,this.onClick.bind(this),this.onSelect.bind(this),this._id(),this.onDeleteHandler.bind(this));

        node[0].id = obj.self;

        this.main_list.appendChild(node[0]);

        this.btn = node[1];
        this.used = node[2];
        this.deleteButton = node[3];

        if(options.checkbox){
            this.used.classList.remove('hidden');
        }

        if(options.deleteButton){
            this.deleteButton.classList.remove('hidden');
        }

        return this;
    };

    three.prototype.onDeleteHandler = function(e){
        this.deleteBtnCallback(e,this);
    };

    three.prototype.hide = function(){
        this.main_list.classList.add('hidden');
    };

    three.prototype.onClick = function(){

        this.expanded = !this.expanded;
        if (this.expanded) {
            this.btn.classList.remove('expanded');
            this.btn.classList.add('colapsed');
        }else{
            this.btn.classList.add('expanded');
            this.btn.classList.remove('colapsed');
        }

        for(var i=0,l=this.childNodes.length;i<l;i++){
            setTimeout(function(a,b){
                return function(){ a.childNodes[b].onClick(); a.childNodes[b].el().classList[a.expanded ? 'add' : 'remove']('hidden') };
            }(this,i),(l-i)*45);
        }
    };

    three.prototype.pushParent = function(parents){
        this.parents.push(parents);
    };

    three.prototype.onSelect = function(e,state) {
        this.selected = state !== undefined ? state : !this.selected;
        this.used.checked = this.selected;

        if(!e) return !1;

        var hashes = [this.id()];
        for(var i=0,l=this.childNodes.length;i<l;i++){
            this.childNodes[i].onSelect(null,(state !== undefined ? state : this.selected));
            hashes.push(this.childNodes[i].id());
        } this.checkbox_callback(this.selected,hashes); this.checkParents();
    };

    three.prototype.checkParents = function(){
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

    three.prototype.addChild = function(clone){
        this.btn.classList.remove('hidden');
        clone.pushParent(this);
        walk_top(clone);
        this.main_list.childNodes[0].appendChild(clone.el());
    };

    function walk_top(n){
        var tmp = n;
        while (tmp.parents.length){
            tmp.parents[0].childNodes.push(n);
            tmp = tmp.parents[0];
        }
    }

    three.prototype.id = function(){
        return this.data.self;
    };

    three.prototype._id = function(){
        return this.data.id;
    };

    three.prototype.isSelected = function(){
        return this.selected;
    };

    three.prototype.top = function(){
        return this.data.top;
    };

    three.prototype.el = function(){
        return this.main_list;
    };

    i.prototype.init = function(container,data,options){

        this.data = data;
        this.collection = {};
        this.iterate = 0;

        for(var item in this.data){
            if(this.data[item].parent && (this.data[item].parent === "0" || (options.keys !== undefined && options.keys.length && options.keys.indexOf(this.data[item].parent) === -1))){
                var root = _el('div'),
                    tmp = new three().init(this.data[item],options);
                root.className = ' col-md-4 mrg10T ';
                root.appendChild(tmp.el());
                this.collection[tmp.id()] = tmp;
                container.appendChild(root);
                delete this.data[item];
            }
        }

        while(++this.iterate < 100){
            for (var item in this.data) {
                if (this.data[item].parent) {
                    var tmp = new three().init(this.data[item],options);
                    if (this.collection[tmp.top()]) {
                        this.collection[tmp.id()] = tmp;
                        this.collection[tmp.top()].addChild(tmp);
                        delete this.data[item];
                    }
                }
            } if(!Object.keys(this.data).length){ break; }
        } console.log(this.iterate,this.data); this.data = data;

        if(options.check !== undefined && options.check.length){
            this.selectItems(options.check);
        }
    };

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

    w.t_view = new i();
})(window,document);