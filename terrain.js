import {TerrainLayer} from './classes/TerrainLayer.js';

/* data = {
	function,
	data:{
	
	}
}
*/
Hooks.on('init',()=>{
	game.socket.on('module.TerrainLayer', async (data) => {
		console.log(data)
		canvas.terrain[data.action].apply(canvas.terrain,data.arguments);
		/*switch(data.action){
			case 'addTerrain':
				canvas.terrain.addTerrain.apply(canvas.terrain,data.arguments)
				break;
			default:
				break;
		}*/
		
	})
})
Hooks.once('canvasInit', (canvas) => {
 console.log('canvasInit')
  const layerct = canvas.stage.getChildIndex(canvas.tokens)-1;

  canvas.terrain = canvas.stage.addChildAt(new TerrainLayer(canvas.scene), layerct);

});
Hooks.on('canvasReady', (canvas) => {

})
/*Hooks.on('preUpdateScene',(scene,updates,diff)=>{
	console.log(scene,updates,diff)
	if(updates?.flags?.TerrainLayer !== undefined){
		if(typeof updates.flags.TerrainLayer['-=costGrid'] !== 'undefined'){ // Something has been unset.
			if(updates.flags.TerrainLayer['-=costGrid'] === null){ //whole grid is unset
				console.log('delete flag')
				canvas.terrain.resetGrid(false); //remove all grid info.
			}else{ // only part of grid was removed

			}
		}
		if(typeof updates.flags.TerrainLayer.costGrid !== 'undefined'){// something has been added.
			//canvas.terrain.costGrid = mergeObject(canvas.terrain.costGrid,updates.flag.TerrainLayer.costGrid
			for( x in updates.flags.TerrainLayer.costGrid){
				console.log(x)
			}
		}
		//canvas.terrain.updateCostGrid(updates.flags.TerrainLayer.costGrid);
	}
	return true;
})
Hooks.on('updateScene',(scene,updates,diff,userID)=>{
	console.log(scene,updates,diff,userID)
})*/


/*
key = `flags.${scope}.${key}`;
return this.update({[key]: value});

static async update(data, options={}) {
    const entityName = this.entity;
    const collection = this.collection;
    const user = game.user;
    options = mergeObject({diff: true}, options);

    // Iterate over requested update data
    data = data instanceof Array ? data : [data];
    const updates = data.reduce((arr, d) => {

      // Get the Entity being updated
      if ( !d._id ) throw new Error(`You must provide an _id for every ${entityName} in the data Array.`);
      const entity = collection.get(d._id, {strict: true});

      // Diff the update against the current data
      if ( options.diff ) {
        d = diffObject(entity.data, expandObject(d));
        if ( isObjectEmpty(d) ) return arr;
        d["_id"] = entity.id;
      }

      // Call pre-update hooks to ensure the update is allowed to proceed
      const allowed = Hooks.call(`preUpdate${entityName}`, entity, d, options, user._id);
      if ( allowed === false ) {
        console.debug(`${vtt} | ${entityName} update prevented by preUpdate hook`);
        return arr;
      }

      // Stage the update
      arr.push(d);
      return arr;
    }, []);
    if ( !updates.length ) return [];

    // Trigger the Socket workflow
    const response = await SocketInterface.dispatch("modifyDocument", {
      type: entityName,
      action: "update",
      data: updates,
      options: options
    });

    // Call the response handler and return the created Entities
    const entities = this._handleUpdate(response);
    return data.length === 1 ? entities[0] : entities;
}
  */