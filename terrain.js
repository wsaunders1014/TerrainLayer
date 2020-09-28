import {TerrainLayer} from './classes/TerrainLayer.js';

Hooks.once('canvasInit', (canvas) => {
 console.log('canvasInit')
  const layerct = canvas.stage.getChildIndex(canvas.tokens)-1;

  canvas.terrain = canvas.stage.addChildAt(new TerrainLayer(canvas.scene), layerct);

});
Hooks.on('canvasReady', (canvas) => {

})
