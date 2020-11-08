Hooks.on('getSceneControlButtons', (controls) => {
	if (game.user.isGM && canvas != null) {
	    controls.push({
			name: 'terrain',
			title: game.i18n.localize('EM.sf'),
			icon: 'fas fa-mountain',
			layer: 'TerrainLayer',
			tools: [
				{
		        	name: 'terraintoggle',
		        	title: game.i18n.localize('EM.onoff'),
		        	icon: 'fas fa-eye',
		        	onClick: () => {
		        	  canvas.terrain.toggle(true);
		        	},
		        	active: canvas.terrain.highlight.children[0].visible,
		        	toggle: true
		        },
				{
					name: 'addterrain',
					title:'EM.select',
					icon:'fas fa-plus-square'
				},
				{
					name:'subtractterrain',
					title:'EM.subtract',
					icon:'fas fa-minus-square'
				},
				{
		          name: 'clearterrain',
		          title: game.i18n.localize('EM.reset'),
		          icon: 'fas fa-trash',
		          onClick: () => {
		            const dg = new Dialog({
		              title: game.i18n.localize('EM.reset'),
		              content: game.i18n.localize('EM.confirmReset'),
		              buttons: {
		                reset: {
		                  icon: '<i class="fas fa-trash"></i>',
		                  label: 'Reset',
		                  callback: () => canvas.terrain.resetGrid(true),
		                },
		                
		                cancel: {
		                  icon: '<i class="fas fa-times"></i>',
		                  label: 'Cancel',
		                },
		              },
		              default: 'cancel',
		            });
		            dg.render(true);
		          },
		          button: true,
		        },
			],
			activeTool:'addterrain'
	  	})
	}
});
Hooks.on('init',()=>{
	game.settings.register('TerrainLayer', 'scale', {
		name: "TerrainLayer.scale-s",
		hint: "TerrainLayer.scale-l",
		scope: "world",
		config: true,
		default: 1,
		type: Number,
		range:{
			min:0.4,
			max:1,
			step:0.1
		},
      	onChange: () => {
      		canvas.terrain.buildFromCostGrid();
      	}
    });
    game.settings.register('TerrainLayer', 'opacity', {
    	name: "TerrainLayer.opacity-s",
		hint: "TerrainLayer.opacity-l",
		scope: "world",
		config: true,
		default: 1,
		type: Number,
		range:{
			min:0.3,
			max:1,
			step:0.1
		},
      	onChange: () => {
      		canvas.terrain.buildFromCostGrid();
      	}
    });
    game.settings.register('TerrainLayer', 'maxMultiple', {
    	name: "TerrainLayer.opacity-s",
		hint: "TerrainLayer.opacity-l",
		scope: "world",
		config: true,
		default: 3,
		type: Number
    });
})