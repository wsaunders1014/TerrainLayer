Hooks.on('getSceneControlButtons', (controls) => {
	if (game.user.isGM) {
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
		            canvas.terrain.toggle();
		          },
		          active: canvas.terrain.highlight.children[0].visible,
		          toggle: true
		        },
				{
					name: 'add',
					title:'EM.select',
					icon:'fas fa-plus-square'
				},
				{
					name:'subtract',
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
		                  callback: () => canvas.terrain.resetGrid(),
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
			activeTool:'add'
	  	})
	}
});
Hooks.on('renderSceneControls', (controls) => {
  // Switching to layer
  if (controls.activeControl === 'terrain') {
    // Open brush tools if not already open
   
  }
  // Switching away from layer
  else {
    // Clear active tool
    
  }
});