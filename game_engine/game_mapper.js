
//-----------------------------------------------------------------------------
// Game map - support the decoding and display of map data.
//
//
// 
//-----------------------------------------------------------------------------
class game_mapper extends game_surface {

    constructor() {
        super();

        this.map = {            
            width: 0,           // width in tiles
            height: 0,          // height in tiles
            tile_width: 0,      // width of a tile (not including border)
            tile_height: 0,     // height of a tile (not including border)
            tile_border: 0,     // map image have a pixel border                       
            key: [],            // location of map tile
            data: []            // map itself
        };
        
    }

    //-----------------------------------------------------------------------------
    // Load the map data (not finished)
    //-----------------------------------------------------------------------------
    load_map_data(map_data_path) {
        
        var file = new XMLHttpRequest();
        file.open('POST', map_data_path, true);
        file.setRequestHeader("Content-type", "text/plain");
        
        file.onreadystatechange = function() {
                        
            if (file.readyState == 4) {
                if (file.status == 200 ) {
                console.log("map loaded " + file.status);
                }
                else {
                    console.log("Error loading map - state =" + file.readystate + " status =" + file.status);                
                }
            }                          
        }        
        
        file.send();        
    }


    //-----------------------------------------------------------------------------
    // Get map key
    //-----------------------------------------------------------------------------
    get_map_key() {
        return this.map.key;
    }

    //-----------------------------------------------------------------------------
    // Set the map key - location of each tile
    //-----------------------------------------------------------------------------
    set_map_key(map_key) {
        this.map.key = map_key;
    }

    //-----------------------------------------------------------------------------
    // Just set and store the map data
    //-----------------------------------------------------------------------------
    set_map_data(map_data, map_width, map_height) {

        this.map.width = map_width;
        this.map.height = map_height;

        // Convert our map data in to arrays.
        var w = 0, h = 0;

        // Javascript does not have multi-dimensional arrays, lets make one. 
        this.map.data = new Array(map_height);    
        for(h = 0; h < map_height; h++)
            this.map.data[h] = new Array(map_width);

        // Store our map data in the md array
        for (h= 0; h < map_height; h ++ ) {
            for (w = 0; w < map_width; w ++) {
               this.map.data[h][w] = map_data.charAt((h*map_width)+w);               
            }
        }                
    }


    // Find out if the sprite is on a tile 
    sprite_center_on_tile_center(x_sprite_pixel_pos, y_sprite_pixel_pos, sprite_width, sprite_height) {

        // Find the center of the sprite
        var sp_center_x = x_sprite_pixel_pos + Math.round(sprite_width /2);
        var sp_center_y = y_sprite_pixel_pos + Math.round(sprite_height /2);

        var pos_x_tile = (sp_center_x % (sp_center_x / this.map.tile_width));
        var pos_y_tile = (sp_center_y % (sp_center_y / this.map.tile_height));

        if (pos_x_tile <2 && pos_y_tile <2) {
            console.log("On Center");
            return true;
        }
        else {
            console.log("Not Center");
            return false;
        }            
    }


    //-----------------------------------------------------------------------------
    // Set/change an item of the at position X,Y based on map co-ordinates
    // of the map 
    //-----------------------------------------------------------------------------
    set_map_tile_map_coords(map_item, x_pos, y_pos) {        
            this.map.data[y_pos][x_pos] = map_item;
    }

    //-----------------------------------------------------------------------------
    // Set/change an item of the at position X,Y based on pixel co-ordinates
    // on the map 
    //-----------------------------------------------------------------------------
    set_map_tile_pixel_coords(map_item, x_pixel_pos, y_pixel_pos) {

        // Convert pixel co-cordinates to map tile coordinates
        var x = Math.floor(x_pixel_pos / this.map.tile_width);
        var y = Math.floor(y_pixel_pos / this.map.tile_height);
        this.set_map_tile_map_coords(map_item, x, y);
    }


    //-----------------------------------------------------------------------------
    // Get a tile from the map array data based on pixel coordinates
    //-----------------------------------------------------------------------------
    get_map_tile_pixel_coords(x_pixel_pos, y_pixel_pos) {
        // Convert pixel co-cordinates to map tile coordinates
        var x = Math.floor(x_pixel_pos / this.map.tile_width);
        var y = Math.floor(y_pixel_pos / this.map.tile_height);

        return this.get_map_tile_map_coords(x, y);        
    }


    //-----------------------------------------------------------------------------
    // Get the tile from the map array data based on map - coordinates
    //-----------------------------------------------------------------------------
    get_map_tile_map_coords(x_pos, y_pos) {

        if (x_pos >=0 && 
            y_pos >=0 &&
            x_pos < this.map.width && 
            y_pos < this.map.height) {
                return this.map.data[y_pos][x_pos];
            }
            else {
                return false;
            }
    }



    //-----------------------------------------------------------------------------
    // Get the position of the map tile frm pixel coords
    //-----------------------------------------------------------------------------
    get_map_tile_position_pixel_coords(x_pixel_pos, y_pixel_pos) {
         // Convert pixel co-cordinates to map tile coordinates
        var x = Math.floor(x_pixel_pos / this.map.tile_width);
        var y = Math.floor(y_pixel_pos / this.map.tile_height);
        return this.get_map_tile_position_map_coords(x, y);
    }


    //-----------------------------------------------------------------------------
    // Get the map tile position from map coords
    //-----------------------------------------------------------------------------
    get_map_tile_position_map_coords(x_pos, y_pos) {
        
        var tile_pos = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            center_x: 0,
            map_x: x_pos,
            map_y: y_pos    
        };

        tile_pos.width = this.map.tile_width;
        tile_pos.height = this.map.tile_height;
        tile_pos.x = x_pos * this.map.tile_width;
        tile_pos.y = y_pos * this.map.tile_height;

        tile_pos.center_x = (this.map.tile_width/2) + tile_pos.x;
        tile_pos.center_y = (this.map.tile_height/2) + tile_pos.y;

        return tile_pos;

    }

    //-----------------------------------------------------------------------------
    // Get the current tile number in array - just easy to test if we have
    // moved on to anothe tile
    //-----------------------------------------------------------------------------
    get_map_tile_number_pixel_coords(x_pixel_pos, y_pixel_pos) {
         // Convert pixel co-cordinates to map tile coordinates
        var x = Math.floor(x_pixel_pos / this.map.tile_width);
        var y = Math.floor(y_pixel_pos / this.map.tile_height);
        return this.get_map_tile_number_map_coords(x, y);
    }

    //-----------------------------------------------------------------------------
    // Get the current tile number in array - just easy to test if we have
    // moved on to anothe tile
    //-----------------------------------------------------------------------------
    get_map_tile_number_map_coords(x_pos, y_pos) {

        if (x_pos >=0 && 
            y_pos >=0 &&
            x_pos < this.map.width && 
            y_pos < this.map.height) {
                return (y_pos * this.map.width) + x_pos; 
            }
            else {
                return false;
            }
    }

    //-----------------------------------------------------------------------------
    // Get the contents of each tile around the current point on a map
    // based on pixel coords
    //-----------------------------------------------------------------------------
    get_map_surrounding_tiles_pixel_coords(x_pos, y_pos) {

        var surrounding_tiles = [
            { key: 'UP',        value: ''},
            { key: 'RIGHT',     value: ''},
            { key: 'DOWN',      value: ''},
            { key: 'LEFT',      value: ''},
            { key: 'TL',        value: ''},
            { key: 'TR',        value: ''},
            { key: 'BR',        value: ''},
            { key: 'BL',        value: ''},
        ];

        // Up down left right
        surrounding_tiles[0].value = this.get_map_tile_pixel_coords(x_pos, (y_pos - this.map.tile_height)); // Up
        surrounding_tiles[2].value = this.get_map_tile_pixel_coords(x_pos, (y_pos + this.map.tile_height)); // Down
        surrounding_tiles[1].value = this.get_map_tile_pixel_coords((x_pos + this.map.tile_width), y_pos);  // Right      
        surrounding_tiles[3].value = this.get_map_tile_pixel_coords((x_pos - this.map.tile_width), y_pos);  // Left


        // Figure out corner
        surrounding_tiles[4].value = this.get_map_tile_pixel_coords((x_pos - this.map.tile_width), (y_pos - this.map.tile_height)); // TL
        surrounding_tiles[5].value = this.get_map_tile_pixel_coords((x_pos + this.map.tile_width), (y_pos - this.map.tile_height)); // TR
        surrounding_tiles[6].value = this.get_map_tile_pixel_coords((x_pos + this.map.tile_width) , (y_pos + this.map.tile_height)); //BR
        surrounding_tiles[7].value = this.get_map_tile_pixel_coords((x_pos + this.map.tile_width) , (y_pos + this.map.tile_height)); //BL

        return surrounding_tiles;

    }


    //-----------------------------------------------------------------------------
    // Load the map data. and store the tile size for the map items 
    //
    //  path            -- path of the image to load
    //  tile_width      -- width of each tile
    //  tile_height     -- height of each tile
    //  border          -- optional does the map image have a pixel border 
    //                      around each tile (how many pixels)?
    //-----------------------------------------------------------------------------
    //load_map_image(path, img_width, img_height, tile_width, tile_height) {
    load_map_image(path, tile_width, tile_height, border) {

        this.map.tile_width = tile_width;
        this.map.tile_height = tile_height;

        if (typeof border == 'undefined')
            this.map.tile_border = 0;
        else
            this.map.tile_border = border;            

        // Create a surface for our image
        //this.create_surface(img_width, img_height);        
        var self = this;
        var promise = new Promise(function(resolve, reject) {

            // Load the image
            var loading_image = new game_image();
            loading_image.load_image(path)
            .then(function() {
                // Draw our image on to our new surface
                self.create_surface(loading_image.get_width(), loading_image.get_height());        
                self.surface.context.drawImage(loading_image.image, 0, 0);                
                loading_image.clear_image();
                resolve('Success');
            },function(){
                reject('Cannot find image ' + path);
            });
        });        
        return promise;
    }



    //-----------------------------------------------------------------------------
    // Draw a grid on the screen
    //-----------------------------------------------------------------------------
    draw_grid(context, grid_width, grid_height, start_position_x, start_position_y) {

        
        var x = 0;
        var y = 0;
        var start_pos_x = 0;
        var start_pos_y = 0;

        var gwidth=10;
        var gheight=10;


        // grid width                            
        if (typeof(grid_width) != undefined)    { gwidth = grid_width; } 
        if (typeof(grid_height) != undefined)   { gheight = grid_height; }


        // start position
        if (typeof(start_position_x) == undefined) { start_pos_x = 0; } else { start_pos_x = start_position_x; }
        if (typeof(start_position_y) == undefined) { start_pos_y = 0; } else { start_pos_y = start_position_y; }

        // total map width        
        var map_width_pixels = this.map.width * this.map.tile_width;
        var map_height_pixels = this.map.height * this.map.tile_height;


        


        // Draw down - going across map
        for(x=start_pos_x; x < map_width_pixels; x+=gwidth) {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x, map_height_pixels);
            context.stroke();
        }

        // Draw across - going down
        x=0;
        for (y=start_pos_y; y < map_height_pixels; y+=gheight) {
            context.beginPath();
            context.moveTo(x,y);
            context.lineTo(map_width_pixels,y);
            context.stroke();
        }           

    }


    //-----------------------------------------------------------------------------
    // Using the mapdata draw the map to the screen
    //-----------------------------------------------------------------------------
    draw(context) {
        
        var x_pos = 0;
        var y_pos = 0;        
        var map_tile;
        var index;


        // change to map.key
        //var tmp_map_array = new Array('.', '═', '║','╔','╗','╚','╝','│','─','┌','┐','└','┘','p');


        // Read the map data at X, Y Pos
        var map_height = this.map.height;
        var map_width = this.map.width;
        for(y_pos = 0; y_pos < map_height ; y_pos ++) {
            for(x_pos = 0; x_pos < map_width; x_pos ++) {

                // Find map data tile
                map_tile = this.map.data[y_pos][x_pos];
                
                // find src position for the image data
                //index = tmp_map_array.indexOf(map_tile);
                index = this.map.key.indexOf(map_tile);
                if (index == -1)
                    continue;

                //var x_pos_src = (index * this.map.tile_width);
                //var y_pos_src = 0;
                var x_pos_src = (index * this.map.tile_width)+((index * this.map.tile_border) + this.map.tile_border);
                var y_pos_src = this.map.tile_border;

                // Draw the tile from src pos to dst pos
                context.drawImage(this.surface.canvas,                      // Src Image
                                x_pos_src,                          // src x
                                y_pos_src,                          // src y
                                this.map.tile_width,                // src width 
                                this.map.tile_height,               // src height
                                (x_pos * this.map.tile_width),      // Dst x
                                (y_pos * this.map.tile_height),     // Dst y
                                this.map.tile_width,                // Dst Width
                                this.map.tile_height                // Dst Height
                                );
                                
            }
        }
    }
}
