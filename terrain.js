import {TerrainLayer} from './classes/TerrainLayer.js';

Hooks.once('canvasInit', (canvas) => {
  // Add SimplefogLayer to canvas
 // CONFIG.debug.mouseInteraction = true;
 // console.log(canvas)
 console.log('canvasInit')
  const layerct = canvas.stage.children.length;
  canvas.terrain = canvas.stage.addChildAt(new TerrainLayer(canvas.scene), layerct);

});
Hooks.on('canvasReady', (canvas) => {

})
// Hooks.on('canvasReady',(canvas)=>{
// 	  const layerct = canvas.stage.children.length;

// 	  canvas.terrain = canvas.stage.addChildAt(new TerrainLayer(canvas.scene), layerct);

// })


/* On Canvas load
1. Add terrain layer

On Terrain Layer construction
2. Check scene.data.flags for grid data
3.Display DT marker on grid squares.




*/
