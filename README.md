# tree_view
Hierarchical tree view

example usage: 

```javascript
var container = document.getElementById('container');

	var myTree = new t_view(), counter = 0;

	myTree.init({
		rootClass: 'col-md-4 col-md-offset-4',
		checkbox:!0,
		collapsed:!1,
		onChecked:function(){
			console.log(arguments);
		},
		components: [
			new myTree.component({ 
				html:'<span class="glyphicon glyphicon-remove"></span>',
				click:function(event,c) {
					c.tree.remove();
				},
				created:function( c ){
					console.log(c);	
				}
			}),
			new myTree.component({ 
				html:'custom',
				click:function(event,c) {
					c.remove();
				},
				created:function( cmp ){
				}
			}),
		],
		data:[
			{
				id: ++counter,
				label: 'Loram '+counter
			},
			{
				parent:1,
				id: ++counter,
				label: 'Loram '+counter
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:2
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent: 3
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent: 4
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:5,
				checked: !0
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:6
			},
			{
				id: ++counter,
				parent:7,
				label: 'Loram '+counter
			},
			{
				id: ++counter,
				parent:8,
				label: 'Loram '+counter
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:1
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent: 2
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent: 3
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:4
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:5
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:6
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:7
			},
			{
				id: ++counter,
				label: 'Loram '+counter,
				parent:8
			}
		],
		container: container
	});
```

example output :

![alt tag](https://raw.githubusercontent.com/crmsoft/tree_view/master/img/treejs.jpg)