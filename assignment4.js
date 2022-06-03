import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Square, Subdivision_Sphere} = defs

function edges(x, y) {
    return [x-1, x+1, y-1, y+1];

}
export class Text_Line extends Shape {                           // **Text_Line** embeds text in the 3D world, using a crude texture
                                                                 // method.  This Shape is made of a horizontal arrangement of quads.
                                                                 // Each is textured over with images of ASCII characters, spelling
                                                                 // out a string.  Usage:  Instantiate the Shape with the desired
                                                                 // character line width.  Then assign it a single-line string by calling
                                                                 // set_string("your string") on it. Draw the shape on a material
                                                                 // with full ambient weight, and text.png assigned as its texture
                                                                 // file.  For multi-line strings, repeat this process and draw with
                                                                 // a different matrix.
    constructor(max_size) {
        super("position", "normal", "texture_coord");
        this.max_size = max_size;
        var object_transform = Mat4.identity();
        for (var i = 0; i < max_size; i++) {                                       // Each quad is a separate Square instance:
            defs.Square.insert_transformed_copy_into(this, [], object_transform);
            object_transform.post_multiply(Mat4.translation(1.5, 0, 0));
        }
    }

    set_string(line, context) {           // set_string():  Call this to overwrite the texture coordinates buffer with new
        // values per quad, which enclose each of the string's characters.
        this.arrays.texture_coord = [];
        for (var i = 0; i < this.max_size; i++) {
            var row = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) / 16),
                col = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) % 16);

            var skip = 3, size = 32, sizefloor = size - skip;
            var dim = size * 16,
                left = (col * size + skip) / dim, top = (row * size + skip) / dim,
                right = (col * size + sizefloor) / dim, bottom = (row * size + sizefloor + 5) / dim;

            this.arrays.texture_coord.push(...Vector.cast([left, 1 - bottom], [right, 1 - bottom],
                [left, 1 - top], [right, 1 - top]));
        }
        if (!this.existing) {
            this.copy_onto_graphics_card(context);
            this.existing = true;
        } else
            this.copy_onto_graphics_card(context, ["texture_coord"], false);
    }
}

function collision(l1, r1, l2, r2)
{
    return ((l1 < l2 && l2 < r1 )||(l1<r2 && r2 < r1))
}

export class Assignment4 extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        this.shapes = {
            box_1: new Cube(),
            box_2: new Cube(),
            text_1: new Text_Line(35),
            axis: new Axis_Arrows(),
            player_run1: new Shape_From_File("./assets/player_run1.obj"),
            player_run2: new Shape_From_File("./assets/player_run2.obj"),
            player_duck1: new Shape_From_File("./assets/player_duck1.obj"),
            player_duck2: new Shape_From_File("./assets/player_duck2.obj"),
            player_duck: new Shape_From_File("./assets/player_duck.obj"),
            ground: new Square(),
            sky: new Subdivision_Sphere(8),
            skybox: new Square(),
        }
        console.log(this.shapes.box_1.arrays.texture_coord)
        // this.shapes.player_run1.arrays.texture_coord.forEach(v => v.scale_by(2));
        // this.shapes.player_run2.arrays.texture_coord.forEach(v => v.scale_by(2));
        // this.shapes.player_duck.arrays.texture_coord.forEach(v => v.scale_by(2));
        this.shapes.ground.arrays.texture_coord.forEach(v=>v.scale_by(20));

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/stars.png")
            }),
            text_image: new Material(new Textured_Phong(), {
                color: hex_color("#232323"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
            player_mat: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/player_texture.png")
            }),
            obstacle_mat: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/powell_cat.jpg")
            }),
            ground_mat: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/bricks_texture.png")
            }),
            grass_mat: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/grass_texture.png")
            }),
            sky_mat: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/sky_texture_1.jpg")
            }),
            skybox_back: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/skybox/Box_Back.png")
            }),
            skybox_bottom: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/skybox/Box_Bottom.png")
            }),
            skybox_front: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/skybox/Box_Front.png")
            }),
            skybox_left: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/skybox/Box_left.png")
            }),
            skybox_right: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/skybox/Box_Right.png")
            }),
            skybox_top: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/skybox/Box_Top.png")
            }),
        }

        this.initial_camera_location = Mat4.look_at(vec3(-4, 5, 14), vec3(5, 3, 0), vec3(0, 1, 0));
        this.obstacle_locations = [
            {obx: 20, xnoise: Math.random()*2-1,
                oby: Math.random()*5, spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 35, xnoise: Math.random()*2-1,
                oby: Math.random()*5, spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 50, xnoise: Math.random()*2-1,
                oby: Math.random()*5,spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 65, xnoise: Math.random()*2-1,
                oby: Math.random()*5,spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 80, xnoise: Math.random()*2-1,
                oby: Math.random()*5,spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
        ]
        this.player_y = 0.0;
        this.velocity = 0.0;
        this.jump = false;
        this.jump_time = 0;
        this.gameover = 0;
        this.final_score = 0;
        this.reset_flag = 0;
    }
    restart(context, program_state){
        program_state.animation_time=0;
        this.initial_camera_location = Mat4.look_at(vec3(-4, 5, 14), vec3(5, 3, 0), vec3(0, 1, 0));
        this.obstacle_locations = [
            {obx: 20, xnoise: Math.random()*2-1,
                oby: Math.random()*5, spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 35, xnoise: Math.random()*2-1,
                oby: Math.random()*5, spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 50, xnoise: Math.random()*2-1,
                oby: Math.random()*5,spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 65, xnoise: Math.random()*2-1,
                oby: Math.random()*5,spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
            {obx: 80, xnoise: Math.random()*2-1,
                oby: Math.random()*5,spawn_time: 0, color:color(Math.random(), Math.random(), Math.random(), 1)},
        ]
        this.player_y = 0.0;
        this.velocity = 0.0;
        this.jump = false;
        this.jump_time = 0;
        this.gameover = 0;
        this.reset_flag = 0;
    }
    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Jump", ["ArrowUp"], ()=>this.jump = true, '#ff0000', ()=>this.jump=false);
        this.key_triggered_button("Duck", ["ArrowDown"], ()=>this.duck=true, '#ff0000', ()=>this.duck=false);
        this.key_triggered_button("Restart", ["q"], ()=>this.reset_flag=1);

    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            //this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.

        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();
        let level =Math.min(Math.floor(t/15+1), 5);
        if(this.reset_flag)
        {
             this.restart(context, program_state);
        }
        else if (!this.gameover) {
            // TODO:  Draw the required boxes. Also update their stored matrices.
            // You can remove the folloeing line.
            program_state.set_camera(this.initial_camera_location);
            //ground
            let model_transform_ground = model_transform;
            model_transform_ground = model_transform_ground.times(Mat4.rotation(1.57, 1, 0, 0)).times(Mat4.translation(0,0,1.7)).times(Mat4.scale(100,5,1));
            this.shapes.ground.draw(context, program_state, model_transform_ground, this.materials.ground_mat);
            let model_transform_grass_left = model_transform;
            model_transform_grass_left = model_transform_grass_left.times(Mat4.rotation(1.57, 1, 0, 0)).times(Mat4.translation(0,-55,1.7)).times(Mat4.scale(100,50,1));
            this.shapes.ground.draw(context, program_state, model_transform_grass_left, this.materials.grass_mat);
            let model_transform_grass_right = model_transform;
            model_transform_grass_right = model_transform_grass_right.times(Mat4.rotation(1.57, 1, 0, 0)).times(Mat4.translation(0,55,1.7)).times(Mat4.scale(100,50,1));
            this.shapes.ground.draw(context, program_state, model_transform_grass_right, this.materials.grass_mat);

            // sky
            // First attempt using subdivision sphere, didn't like how it made game look like a circle
            // let model_transform_sky = model_transform;
            // model_transform_sky = model_transform_sky.times(Mat4.scale( 50,50,50));
            // this.shapes.sky.draw(context,program_state, model_transform_sky, this.materials.sky_mat);

            let model_transform_sky_back = model_transform;
            model_transform_sky_back = model_transform_sky_back.times(Mat4.scale(50,50,50)).times(Mat4.rotation(1.57, 0,1,0)).times(Mat4.translation(0,0,-1));
            this.shapes.skybox.draw(context,program_state, model_transform_sky_back, this.materials.skybox_back);
            let model_transform_sky_front = model_transform;
            model_transform_sky_front = model_transform_sky_front.times(Mat4.scale(50,50,50)).times(Mat4.rotation(1.57, 0,1,0)).times(Mat4.translation(0,0,1));
            this.shapes.skybox.draw(context,program_state, model_transform_sky_front, this.materials.skybox_front);
            let model_transform_sky_left = model_transform;
            model_transform_sky_left = model_transform_sky_left.times(Mat4.scale(50,50,50)).times(Mat4.translation(0,0,1));
            this.shapes.skybox.draw(context,program_state, model_transform_sky_left, this.materials.skybox_left);
            let model_transform_sky_right = model_transform;
            model_transform_sky_right = model_transform_sky_right.times(Mat4.scale(50,50,50)).times(Mat4.translation(0,0,-1)).times(Mat4.rotation(3.14,0,1,0));
            this.shapes.skybox.draw(context,program_state, model_transform_sky_right, this.materials.skybox_right);
            let model_transform_sky_top = model_transform;
            model_transform_sky_top = model_transform_sky_top.times(Mat4.scale(50,50,50)).times(Mat4.translation(0,1,0)).times(Mat4.rotation(1.57,1,0,0));
            this.shapes.skybox.draw(context,program_state, model_transform_sky_top, this.materials.skybox_top);
            //player
            let model_transform_player = model_transform;
            if (this.jump && this.player_y == 0){
                this.velocity = 35;
            }
            const acceleration = -70*(t-this.jump_time);
            this.player_y += (t-this.jump_time) * (this.velocity + acceleration * (1/2));
            this.player_y = Math.max(this.player_y, 0.0);
            this.velocity +=acceleration;
            model_transform_player = model_transform_player.times(Mat4.translation(0,this.player_y,0));

            this.jump_time = t;

            let tmp1 = this.shapes.player_run1;
            let tmp2 = this.shapes.player_run2;

            if (this.duck) {
                this.velocity = -35;
                if (this.player_y ===0){
                    //model_transform_player = model_transform_player.times(Mat4.scale(1,1/2,1)).times(Mat4.translation(0,-1,0));
                    if (Math.round(4*t) % 2 !== 0) {
                        this.shapes.player_run1 = this.shapes.player_run2 = this.shapes.player_duck1;
                    }
                    else
                        this.shapes.player_run1 = this.shapes.player_run2 = this.shapes.player_duck2;
                    //model_transform_player = model_transform_player.times(Mat4.rotation(1, 0,1,0));
                }
            }
            model_transform_player = model_transform_player.times(Mat4.rotation(-1.5, 0,1,0));
            if (Math.round(4*t) % 2 !== 0 && this.player_y === 0) {
                this.shapes.player_run1.draw(context, program_state, model_transform_player, this.materials.player_mat);
                this.shapes.player_run1 = tmp1;
                this.shapes.player_run2 = tmp2;
            }
            else{
                this.shapes.player_run2.draw(context, program_state, model_transform_player, this.materials.player_mat);
                this.shapes.player_run1 = tmp1;
                this.shapes.player_run2 = tmp2;
            }
            // else if (this.duck && this.player_y ===0)
            //     this.shapes.player_duck.draw(context, program_state, model_transform_player, this.materials.phong);
            // else
            //     this.shapes.player_run2.draw(context, program_state, model_transform_player, this.materials.phong);


            let plocs = edges(model_transform_player[0][3], model_transform_player[1][3])
            //score
            let score = t*3
            score = "Score:" + Math.floor(score).toString();
            this.shapes.text_1.set_string(score, context.context);
            //this.shapes.text_1.draw(context, program_state, model_transform.times(Mat4.translation(5, 11.5, 0)).times(Mat4.scale(0.3, 0.3, 0.3)), this.materials.text_image);
            this.shapes.text_1.draw(context, program_state, Mat4.inverse(this.initial_camera_location).times(Mat4.translation(-2, 5.5, -15)).times(Mat4.scale(0.3, 0.3, 0.3)), this.materials.text_image);
            this.shapes.text_1.set_string("Level: "+level, context.context);
            //this.shapes.text_1.draw(context, program_state, model_transform.times(Mat4.translation(16, 11.5, 0)).times(Mat4.scale(0.3, 0.3, 0.3)), this.materials.text_image);
            this.shapes.text_1.draw(context, program_state, Mat4.inverse(this.initial_camera_location).times(Mat4.translation(6, 5.5, -15)).times(Mat4.scale(0.3, 0.3, 0.3)), this.materials.text_image);
            //obstacles

            for (let i = 0; i < this.obstacle_locations.length; i++) {
                let x_loc = this.obstacle_locations[i].obx - (10+level*4)* dt;//(t - this.obstacle_locations[i].spawn_time);
                this.obstacle_locations[i].obx = x_loc;
                if (x_loc < -11) {
                    this.obstacle_locations[i].obx = 69;
                    this.obstacle_locations[i].oby = Math.random() * 5;
                    //this.obstacle_locations[i].spawn_time = t;
                    this.obstacle_locations[i].xnoise = Math.random() * 2 - 1;
                    this.obstacle_locations[i].color = color(Math.random(), Math.random(), Math.random(), 1)
                    x_loc = this.obstacle_locations[i].obx;
                }
                x_loc += this.obstacle_locations[i].xnoise;
                let model_transform_obstacle = model_transform.times(Mat4.translation(x_loc, this.obstacle_locations[i].oby, 0));
                let olocs = edges(model_transform_obstacle[0][3], model_transform_obstacle[1][3]);

                if (collision(plocs[0], plocs[1], olocs[0], olocs[1]) && collision(plocs[2], plocs[3], olocs[2], olocs[3])) {
                    this.gameover = 1;
                    this.final_score = score;
                    //document.getElementById('game-over-layout').classList.toggle('activate');
                    break;
                }
                // rainbow cats
                //this.shapes.box_2.draw(context, program_state, model_transform_obstacle, this.materials.obstacle_mat.override({color: this.obstacle_locations[i].color}));
                // regular cats
                this.shapes.box_2.draw(context, program_state, model_transform_obstacle, this.materials.obstacle_mat.override({color: hex_color("000000")}));

            }
        }
        else
        {
            program_state.set_camera(Mat4.look_at(vec3(7, 4, 18), vec3(7, 5, 0), vec3(0, 1, 0)));
            let print_string = "GAME OVER"
            this.shapes.text_1.set_string(print_string, context.context);
            this.shapes.text_1.draw(context, program_state, model_transform.times(Mat4.translation(0, 6, 0))
                .times(Mat4.scale(1.1, 1.1, 1.1)), this.materials.text_image);
            this.shapes.text_1.set_string("Press Q to restart", context.context);
            this.shapes.text_1.draw(context, program_state, model_transform.times(Mat4.translation(2, 4, 0))
                .times(Mat4.scale(0.4, 0.4, 0.4)), this.materials.text_image)
            this.shapes.text_1.set_string(this.final_score, context.context);
            this.shapes.text_1.draw(context, program_state, model_transform.times(Mat4.translation(5, 2, 0))
                .times(Mat4.scale(0.4, 0.4, 0.4)), this.materials.text_image);



            //refresh on click
        }
    }

}


class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}


class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}
