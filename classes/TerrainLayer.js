//TERRAIN LAYER
let TLControlPress = false;
class TerrainSquare extends PIXI.Graphics {
  constructor(coord,...args){
    super(...args);
    this.coord = coord;
    let topLeft = canvas.grid.grid.getPixelsFromGridPosition(coord.x,coord.y)
    this.thePosition = `${topLeft[0]}.${topLeft[1]}`;
   
  }
}
export class TerrainHighlight extends PIXI.Graphics {
  constructor(name,...args){
    super(...args);

    /**
     * Track the Grid Highlight name
     * @type {String}
     */
    this.name = name;

    /**
     * Track distinct positions which have already been highlighted
     * @type {Set}
     */
    this.visible = canvas.scene.getFlag('TerrainLayer','sceneVisibility') || true;
    this.positions = new Set();
  }

  /* -------------------------------------------- */

  /**
   * Record a position that is highlighted and return whether or not it should be rendered
   * @param {Number} x    The x-coordinate to highlight
   * @param {Number} y    The y-coordinate to highlight
   * @return {Boolean}    Whether or not to draw the highlight for this location
   */
  highlight(pxX, pxY) {
    let key = `${pxX}.${pxY}`;
    if ( this.positions.has(key) ) return false;
    this.positions.add(key);
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Extend the Graphics clear logic to also reset the highlighted positions
   * @param args
   */
  clear(...args) {
    super.clear(...args);
    this.positions = new Set();
  }


  /* -------------------------------------------- */

  /**
   * Extend how this Graphics container is destroyed to also remove parent layer references
   * @param args
   */
  destroy(...args) {
    delete canvas.terrain.highlightLayers[this.name];
    super.destroy(...args);
  }
}
export class TerrainLayer extends CanvasLayer{
	constructor(scene){
		super();
    this.scene = scene;
    this.sceneId = this.scene._id;
    this.layerName = `DifficultTerrain.${this.scene._id}`;
    this.highlight = null;
    this.mouseInteractionManager = null;
    this.dragging = false;
    this._addListeners();
	}
  async draw(){

    this._deRegisterMouseListeners()
    await super.draw();
    this.highlightLayers = {};
    this.scene = canvas.scene;
    this.sceneId = this.scene._id;
    this.layerName = `DifficultTerrain.${this.scene._id}`;
    this.highlight = this.addChild(new PIXI.Container());
    this.addHighlightLayer(this.layerName);
    this.costGrid = this.scene.getFlag('TerrainLayer','costGrid') || {};
    Hooks.once('canvasReady',this.buildFromCostGrid.bind(this))
    return this;
  }
  async tearDown(){
    super.tearDown();
    this._deRegisterMouseListeners()
    this._deRegisterKeyboardListeners();
  }
  toggle(){
    this.highlight.children[0].visible = !this.highlight.children[0].visible;
    canvas.scene.setFlag('TerrainLayer','sceneVisibility', this.highlight.children[0].visible )
  }
  _addListeners() {

    // Define callback functions for mouse interaction events
    const callbacks = {
      dragLeftStart: this._onDragLeftStart.bind(this),
      dragLeftMove: this._onDragLeftMove.bind(this),
      clickRight: this._onClickRight.bind(this),
      dragRightMove: this._onDragRightMove.bind(this),
      dragLeftDrop:this._onDragLeftDrop.bind(this)
    };

    // Create and activate the interaction manager
    const permissions = {};
    const mgr = new MouseInteractionManager(this, this, permissions, callbacks);
    this.mouseInteractionManager = mgr.activate();

  }
  addHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    if ( !layer || layer._destroyed ) {
      this.highlightLayers[name] = this.highlight.addChild(new TerrainHighlight(name));
      console.log(canvas.scene.getFlag('TerrainLayer','sceneVisibility'))
      canvas.terrain.highlight.children[0].visible = (typeof canvas.scene.getFlag('TerrainLayer','sceneVisibility') !='undefined') ?  canvas.scene.getFlag('TerrainLayer','sceneVisibility'):true;
    }
    return this.highlightLayers[name];
  }
  getHighlightLayer(name) {
    return this.highlightLayers[name];
  }
  /**
   * Clear a specific Highlight graphic
   * @param name
   */
  clearHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    if ( layer ) layer.clear();
  }
  /* -------------------------------------------- */

  /**
   * Destroy a specific Highlight graphic
   * @param name
   */
  destroyHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    this.highlight.removeChild(layer);
    layer.destroy();
  }
  highlightPosition(name, options) {
    const layer = this.highlightLayers[name];
    if ( !layer ) return false;
    if(canvas.grid.type == 1)
      this.highlightGridPosition(layer, options);
    else if(canvas.grid.type == 2 || canvas.grid.type == 3 || canvas.grid.type == 4 || canvas.grid.type == 5)
      this.highlightHexPosition(layer,options);
  }
  /** @override */
  highlightGridPosition(layer , {gridX, gridY, multiple=2}={}) {
    //GRID ALREADY HIGHLIGHTED
    let gsW = canvas.grid.grid.w;
    let gsH = canvas.grid.grid.h;
    
    let px = canvas.grid.grid.getPixelsFromGridPosition(gridX,gridY)
    
    const key = `${px[0]}.${px[1]}`;
    if ( layer.positions.has(key) ) {
    
      let square = this.getSquare(layer,key)

      let cost = this.costGrid[gridX][gridY];
      if(cost.multiple <3){
        this.costGrid[gridX][gridY].multiple+=1;

      }else{
         this.costGrid[gridX][gridY].multiple=2;
      } 
      square.getChildAt(0).text = `x${cost.multiple}`;
      return;
    }else{
       layer.highlight(px[0],px[1]);
      let s = canvas.dimensions.size;
      let terrainSquare = new TerrainSquare({x:gridX,y:gridY})
      let offset = 15;
      terrainSquare.x = px[0];
      terrainSquare.y = px[1];
      terrainSquare.width = gsW;
      terrainSquare.height = gsH;
      terrainSquare.lineStyle(7, 0xffffff, 0.5);
      terrainSquare.moveTo((gsW/2), offset);
      terrainSquare.lineTo(offset, gsH-offset);
      terrainSquare.lineTo(gsW-offset, gsH-offset);
      terrainSquare.lineTo((gsW/2), offset);
      terrainSquare.closePath();
      terrainSquare.blendMode = PIXI.BLEND_MODES.OVERLAY;
   
      let text = new PIXI.Text('x'+multiple,{fontFamily : 'Arial', fontSize: 12, fill : 0xffffff,opacity:0.5, align : 'center'})
      text.blendMode = PIXI.BLEND_MODES.OVERLAY;
      text.anchor.set(0.5,0.5);
      text.x = gsW/2;
      text.y = (gsH/2)+7;
    
      terrainSquare.addChild(text);
      layer.addChild(terrainSquare);
      this.addToCostGrid(gridX,gridY);
    }
    
    
  }
 
	_registerMouseListeners() {
	    this.addListener('pointerup', this._pointerUp);
	    this.dragging = false;
	}
	_registerKeyboardListeners() {
  	$(document).keydown((event) => {
  		
  		//if (ui.controls.activeControl !== this.layername) return;
  		switch(event.which){
  			case 27:
  				event.stopPropagation();
  				ui.menu.toggle();
  			break;
        case 17:
          TLControlPress = true;
          break;
  			default:
  			break;
  		}
  	});
    $(document).keyup((event)=>{
      switch(event.which){
        case 17:
          TLControlPress = false;
          break;
        default:
        break;
      }
    })
	}
	_deRegisterMouseListeners(){
    this.removeListener('pointerup', this._pointerUp);
	}
	_deRegisterKeyboardListeners(){
		$(document).off('keydown')
    $(document).off('keyup');
	}

	_pointerUp(e) {
    let pos = e.data.getLocalPosition(canvas.app.stage);
    let gridPt = canvas.grid.grid.getGridPositionFromPixels(pos.x,pos.y);
    let pxX = canvas.grid.grid.getPixelsFromGridPosition(gridPt[0],gridPt[1])
    
    let [x,y] = gridPt;  //Normalize the returned data because it's in [y,x] format
    let gsW = Math.round(canvas.grid.grid.w);
    let gsH = Math.floor(canvas.grid.grid.h);
    let gs = Math.min(gsW,gsH)
    let gridPX = {x:Math.round(x*gsH),y:Math.round(y*gsW)}
   
    switch(e.data.button){
      case 0:
        if(game.activeTool == 'add' && !this.dragging){
          this.highlightPosition(this.layerName,{gridX:x,gridY:y})
         
          this.updateCostGridFlag()
        }else if(game.activeTool  == 'subtract'){
          const layer = canvas.terrain.getHighlightLayer(this.layerName);
          const key = `${gridPX.x}.${gridPX.y}`;
          this.removeDifficultTerrain(layer,gridPX.x,gridPX.y);
          this.removeFromCostGrid(x,y);
          this.updateCostGridFlag()
        }
      break;
      default:
      break;
    }
    this.dragging = false;
	}
  highlightHexPosition(layer,{gridX,gridY,multiple=2}={}){
    
    let gsW = Math.floor(canvas.grid.grid.w);
    let gsH = Math.round(canvas.grid.grid.h);
   
    let topLeft = canvas.grid.grid.getPixelsFromGridPosition(gridX,gridY)
    let pxX = topLeft[0];
    let pxY = topLeft[1];
  
    const points = canvas.grid.grid.options.columns ? canvas.grid.grid.constructor.flatHexPoints : canvas.grid.grid.constructor.pointyHexPoints;
    const coords = points.reduce((arr, p) => {
      arr.push(topLeft[0] + (p[0]*gsW));
      arr.push(topLeft[1] + (p[1]*gsH));
      return arr;
    }, []);
    
    const key = `${pxX}.${pxY}`;
    if(layer.positions.has(key)) {
      const gs = canvas.dimensions.size;
      
      let square = this.getSquare(layer,key)

      let cost = this.costGrid[gridX][gridY];
      if(cost.multiple <3){
        this.costGrid[gridX][gridY].multiple+=1;

      }else{
         this.costGrid[gridX][gridY].multiple=2;
      } 
      square.getChildAt(0).text = `x${cost.multiple}`;
      return;
    }else{
      let col = canvas.grid.grid.columns;
      let even = canvas.grid.grid.even;
     
      let terrainSquare = new TerrainSquare({x:gridX,y:gridY})
      layer.highlight(pxX,pxY);
      
      let offset = gsH* 0.16;

      const halfW = (gsW/2)
    
      terrainSquare.y = topLeft[1];
      terrainSquare.x = topLeft[0];
     
      terrainSquare.width = gsW;
      terrainSquare.height = gsH;
      
     let text = new PIXI.Text('x'+multiple,{fontFamily : 'Arial', fontSize: 12, fill : 0xffffff,opacity:0.5, align : 'center'})

      
      if(canvas.grid.type == 4 || canvas.grid.type == 5){
        terrainSquare.lineStyle(4, 0xffffff, 0.5);
        terrainSquare.moveTo(halfW,offset*2);
        terrainSquare.lineTo(offset*2, gsW-(offset*3));
        terrainSquare.lineTo(gsW-(offset*2), gsW-(offset*3));
        terrainSquare.lineTo(halfW, offset*2);
        text.y = (gsH/2)+3;
      }else{
        terrainSquare.lineStyle(7, 0xffffff, 0.5);
        terrainSquare.moveTo(halfW,offset);
        terrainSquare.lineTo(offset, gsW-offset);
        terrainSquare.lineTo(gsW-offset, gsW-offset);
        terrainSquare.lineTo(halfW, offset);
        text.y = (gsH/2)+7;
      }
      
      terrainSquare.closePath();
      terrainSquare.blendMode = PIXI.BLEND_MODES.OVERLAY;
   
      
      text.blendMode = PIXI.BLEND_MODES.OVERLAY;
      text.anchor.set(0.5,0.5);
      text.x = gsW/2;
      
    
      terrainSquare.addChild(text);
     
      
      layer.addChild(terrainSquare);
      this.addToCostGrid(gridX,gridY);
    }
  }
  removeFromCostGrid(x,y){
    if(typeof this.costGrid[x] == 'undefined') return false;
    if(typeof this.costGrid[x][y] == 'undefined') return false;
      
    delete this.costGrid[x][y];
  }
  addToCostGrid(x,y){
   
    if(typeof this.costGrid[x] == 'undefined')
      this.costGrid[x] = {}
    this.costGrid[x][y]={multiple:2,type:'ground'};
  }
  async updateCostGridFlag(){
    let x = this.costGrid;
     await canvas.scene.unsetFlag('TerrainLayer','costGrid');
     await canvas.scene.setFlag('TerrainLayer','costGrid',x)
  }
	buildFromCostGrid(){

    for(let x in this.costGrid){
      for(let y in this.costGrid[x]){
       
        this.highlightPosition(this.layerName,{gridX:parseInt(x),gridY:parseInt(y),multiple:this.costGrid[x][y].multiple})
      }
    }
  }
  async resetGrid(){
    this.getHighlightLayer(this.layerName).clear();
    this.getHighlightLayer(this.layerName).removeChildren();
    this.costGrid = {}
    this.scene.unsetFlag('TerrainLayer','costGrid');
  }
  selectSquares(coords){
    const startPx = canvas.grid.grid.getCenter(coords.x,coords.y)
    const startGrid = canvas.grid.grid.getGridPositionFromPixels(startPx[0],startPx[1])

    const endPx =  canvas.grid.grid.getCenter(coords.x+coords.width,coords.y+coords.height)
    const endGrid = canvas.grid.grid.getGridPositionFromPixels(endPx[0],endPx[1])

    for(let x = startGrid[1];x<=endGrid[1];x++){
      for(let y = startGrid[0];y<=endGrid[0];y++){
        let [pxX,pxY] = canvas.grid.grid.getPixelsFromGridPosition(y,x)
        if(game.activeTool == 'add' && TLControlPress == false){
          this.highlightPosition(this.layerName,{gridX:y,gridY:x})
          //this.addToCostGrid(x,y);
        }else if(game.activeTool == 'subtract' || TLControlPress){
          const layer = canvas.terrain.getHighlightLayer(this.layerName);
          const key = `${pxX}.${pxY}`;

          this.removeDifficultTerrain(layer,key)
          this.removeFromCostGrid(x,y);
        }
      }
    }
    this.updateCostGridFlag();

  }
  removeDifficultTerrain(layer,key){
    if(!layer.positions.has(key)) return false;
    let square = this.getSquare(layer,key);
    square.destroy();
    layer.positions.delete(key)
    

  }
  getSquare(layer,key){
     let square = layer.children.find((x)=>{
      return x.thePosition == key
    })
     return square || false;
  }
  _onDragLeftStart(e){
    this.dragging = true;
  }

  _onDragLeftMove(e){
    const isSelect = ["add","subtract"].includes(game.activeTool);
    if ( isSelect ) return this._onDragSelect(e);
  }
  _onDragSelect(event) {

    // Extract event data
    const {origin, destination} = event.data;

    // Determine rectangle coordinates
    let coords = {
      x: Math.min(origin.x, destination.x),
      y: Math.min(origin.y, destination.y),
      width: Math.abs(destination.x - origin.x),
      height: Math.abs(destination.y - origin.y)
    };

    // Draw the select rectangle
    canvas.controls.drawSelect(coords);
    event.data.coords = coords;

  }
  _onDragLeftDrop(e){
    const tool = game.activeTool;
    // Conclude a select event

    const isSelect = ["add","subtract"].includes(tool);
    if ( isSelect ) {
      canvas.controls.select.clear();
      canvas.controls.select.active = false;
      if ( tool === "add" || tool === "subtract") return this.selectSquares(e.data.coords);
    }
    canvas.controls.select.clear();
  }
  _onClickRight(e){
    /* DELETE TERRAIN SQUARE */
    let pos = e.data.getLocalPosition(canvas.app.stage);
    let gridPt = canvas.grid.grid.getGridPositionFromPixels(pos.x,pos.y);
    let px = canvas.grid.grid.getPixelsFromGridPosition(gridPt[0],gridPt[1])
    //Normalize the returned data because it's in [y,x] format
    let [x,y] = gridPt;

    let key = `${px[0]}.${px[1]}`;
    const layer = canvas.terrain.getHighlightLayer(this.layerName);
    let square = this.getSquare(layer,key)
    if(game.activeTool == 'add' && square){
     
      this.removeDifficultTerrain(layer,key);
      this.removeFromCostGrid(x,y);
      this.updateCostGridFlag();
    }
  }
  
  _onDragRightMove(event) {

    // Extract event data
    const DRAG_SPEED_MODIFIER = 0.8;
    const {cursorTime, origin, destination} = event.data;
    const dx = destination.x - origin.x;
    const dy = destination.y - origin.y;

    // Update the client's cursor position every 100ms
    const now = Date.now();
    if ( (now - (cursorTime || 0)) > 100 ) {
      if ( canvas.controls ) canvas.controls._onMoveCursor(event, destination);
      event.data.cursorTime = now;
    }

    // Pan the canvas
    canvas.pan({
      x: canvas.stage.pivot.x - (dx * DRAG_SPEED_MODIFIER),
      y: canvas.stage.pivot.y - (dy * DRAG_SPEED_MODIFIER)
    });

    
  }
  activate() {
    super.activate();
    this.interactive = true;
    this._registerMouseListeners();
    this._registerKeyboardListeners();
  }
	/**
	* Actions upon layer becoming inactive
	*/
	deactivate() {
		super.deactivate();
		this.interactive = false;
		this._deRegisterMouseListeners();
		this._deRegisterKeyboardListeners();

	}
}