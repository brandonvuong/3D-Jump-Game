import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

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
            axis: new Axis_Arrows()
        }
        console.log(this.shapes.box_1.arrays.texture_coord)


        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png")
            }),
        }
        this.initial_camera_location = Mat4.look_at(vec3(7, 4, 18), vec3(7, 5, 0), vec3(0, 1, 0));
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
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Jump", ["ArrowUp"], ()=>this.jump = true, hex_color('#ff0000'), ()=>this.jump=false);


    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }
        let alive = 1;
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // You can remove the folloeing line.
        if(alive){
            //player
            if (this.jump && this.player_y == 0){
                this.velocity = 35;
            }
            const acceleration = -70*(t-this.jump_time);
            this.player_y += (t-this.jump_time) * (this.velocity + acceleration * (1/2));
            this.player_y = Math.max(this.player_y, 0.0);
            this.velocity +=acceleration;
            let model_transform_player = model_transform.times(Mat4.translation(0,this.player_y,0));

            this.jump_time = t;


            this.shapes.box_1.draw(context, program_state, model_transform_player, this.materials.phong.override({color: hex_color("#ff0000")}));
            //obstacles
            for(let i = 0; i < this.obstacle_locations.length; i++)
            {
                let x_loc = this.obstacle_locations[i].obx-12*(t-this.obstacle_locations[i].spawn_time);
                if (x_loc < -11)
                {
                    this.obstacle_locations[i].obx = 69;
                    this.obstacle_locations[i].oby = Math.random()*5;
                    this.obstacle_locations[i].spawn_time = t;
                    this.obstacle_locations[i].xnoise = Math.random()*2-1;
                    this.obstacle_locations[i].color = color(Math.random(), Math.random(), Math.random(), 1)
                    x_loc = this.obstacle_locations[i].obx;
                }
                x_loc+= this.obstacle_locations[i].xnoise;
                let model_transform_obstacle = model_transform.times(Mat4.translation(x_loc, this.obstacle_locations[i].oby, 0));

                this.shapes.box_2.draw(context, program_state, model_transform_obstacle, this.materials.phong.override({color:this.obstacle_locations[i].color}));
            }



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
