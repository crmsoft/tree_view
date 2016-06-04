!function(w,d){
	var extras = {

			_el:function (name){ return document.createElement(name); },

		    c_node:function(data,clb,selected,id,state){
		        var li = this._el('li')
		            ,d = this._el('div')
		            ,node_text = this._el('span')
		            ,l = this._el('span')
		            ,container = this._el('div')
		            ,c = this._el('input')
		            ,b = this._el('a');

		        node_text.className = ' node-text';
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
		        node_text.innerHTML = data.parent === undefined ? '<b>'+data.label+'</b>':data.label;

		        container.appendChild(c);
		        l.appendChild(b);
		        d.appendChild(l);
		        d.appendChild(node_text);
		        d.appendChild(container);
		        li.appendChild(d);
		        
		        return {
		           components:container
		           ,root: this._el('ol')
		           ,container:li
		           ,expander: b
		           ,checkBox: c
		           ,nodeText:node_text
		        };
		    },

		    gebi:function(id){
		        return d.getElementById(id);
		    },

		    log:function (){
		        var t = Array.prototype.slice.call(arguments);
		        console.info.call(console, '%c TreeJS Debug : ','background: #ff508e; color: #fff;padding:5px', t.join(' '));
		    },

		    extend:function() {
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
		    },

		    append_child:function(n){
		        var tmp = n;
		        while (tmp.parents.length){
		            tmp.parents[0].childNodes.push(n);
		            tmp = tmp.parents[0];
		        } 
		    },

		    unid:function(prefix){
		        return prefix+'-xxx-yxxx-x'.replace(/[xy]/g, function(c) {
		            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		            return v.toString(16);
		        });
		    },

		    set_depth:function(node){
		        for(var i=0,ln=node.childNodes.length; i<ln; i++){
		            node.childNodes[i].depth++;
		            this.set_depth(node.childNodes[i]);
		        } return !0;
		    },

		    create_component:function(o){
		        var btn = extra._el('a')
		            ,wrap = extra._el('div');
		            
		            wrap.className = ' pull-right ';

		            wrap.id = extra.unid('tree-component');

		            btn.className = ' btn btn-small btn-xs ';
		            btn.innerHTML = o.html;

		            wrap.appendChild( btn );
		        
		        return wrap;
		    }
	};
	w.extra = extras;
}(window,document);