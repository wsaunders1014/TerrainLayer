import {TerrainLayer} from './classes/TerrainLayer.js';

Hooks.on('init',()=>{
	game.socket.on('module.TerrainLayer', async (data) => {
		console.log(data)
		canvas.terrain[data.action].apply(canvas.terrain,data.arguments);
	})
})
let theLayers = Canvas.layers;
theLayers.terrain = TerrainLayer;

Object.defineProperty(Canvas, 'layers', {get: function() {
    return theLayers
  }})
