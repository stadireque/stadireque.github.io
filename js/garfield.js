function main(){
    const canvas = document.getElementById("webglCan");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.scroll = "none";

    const gl = canvas.getContext("webgl");
    if (gl === null){
        alert("Pas de webGL dans cette histoire, ça va pas être possible");
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        varying highp vec2 vTextureCoord;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        attribute vec2 aTextureCoord;

        varying vec4 vPos;

        uniform lowp float uNumFrame;
        varying lowp float vNumFrame;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition ;
            // gl_Position = aVertexPosition ;
            vPos = gl_Position * 0.5 + 0.5;
            vTextureCoord = aTextureCoord;

            vNumFrame = uNumFrame;
        }
    `;


    // fragment
    const fsSource = `
    // float vec4 vPos;
    // highp vec4 vPos;

    // nécessaire sinon il râle qu'on n'a pas défini de précision sur les vec4 (on peut mettre highp)
    // precision mediump float; 
    precision lowp float; 

    varying vec4 vPos;

    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;

    varying lowp float vNumFrame;

    void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
    `;

    // compilation des shaders 
    const Vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(Vshader, vsSource);
    gl.compileShader(Vshader);

    if (gl.getShaderParameter(Vshader, gl.COMPILE_STATUS) === false) {
        alert("bigre la compilation échoua : " + gl.getShaderInfoLog(Vshader));
        gl.deleteShader(Vshader);
        return;
    }


    const Fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(Fshader, fsSource);
    gl.compileShader(Fshader);
    if (!gl.getShaderParameter(Fshader, gl.COMPILE_STATUS)) {
        alert(`ça par exemple, la compilation du fragment shader a raté : ${gl.getShaderInfoLog(Fshader)}`);
        gl.deleteShader(Fshader);
        return;
    }

    // linking park
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, Vshader);
    gl.attachShader(shaderProgram, Fshader);

    gl.linkProgram(shaderProgram);
    if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) === false) {
        alert(`Bah zut, le linking a raté : ${gl.getProgramInfoLog(shaderProgram,)}`);
        return;
    }

    // choper les location des variables dans les shaders
    // j'aurai besoin de tout ça dans le draw
    const progInfos = {
        prog: shaderProgram,
        vPos: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        texCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        projMat: gl.getUniformLocation(shaderProgram,"uProjectionMatrix"),
        modViewMat: gl.getUniformLocation(shaderProgram,"uModelViewMatrix"),
        uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),

        numFrame: gl.getUniformLocation(shaderProgram, "uNumFrame"),
    }

    console.log("numFrame : " + numFrame);

    // un buffer pour les vertices
    const vertices = [
            -1.0,  1.0,  -1.0, 
            1.0,  1.0,  -1.0, 
            1.0,  1.0,   1.0, 
            
            -1.0,  1.0, -1.0, 
             1.0,  1.0, 1.0, 
            -1.0,  1.0, 1.0,


            1.0,  1.0, -1.0, 
            1.0, -1.0, -1.0,
            1.0, 1.0, 1.0,
            
            1.0, -1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,


            1.0,-1.0,-1.0,
            -1.0,-1.0,-1.0,
            -1.0,-1.0,1.0,
            
            1.0,-1.0,-1.0,
            -1.0,-1.0,1.0,
            1.0,-1.0,1.0,


            -1.0,-1.0,-1.0,
            -1.0,1.0,-1.0,
            -1.0,1.0,1.0,
            
            -1.0,-1.0,-1.0,
            -1.0,1.0,1.0,
            -1.0,-1.0,1.0,
        ];

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(
        progInfos.vPos,
        3, // numComponents,
        gl.FLOAT, // type,
        false, //normalize,
        0, //stride,
        0 //offset,
    );
    gl.enableVertexAttribArray(progInfos.vPos);

    ///////////////////////// texture
    
    const texture = gl.createTexture();
    const pixel = new Uint8Array([0, 153, 255, 255]); 
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixel,
    );
    
    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0, // level,
            gl.RGBA, //internalFormat,
            gl.RGBA, // srcFormat,
            gl.UNSIGNED_BYTE, //srcType,
            image,
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    // image.src = "/img/chel.jpg";
    image.src = "/img/gneeee_01.png";
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //  coordonnées de la texture
    const textureCoordBuffer = gl.createBuffer();
    const textureCoordinates = [
        0.0,0.0,
        1.0,0.0,
        1.0, 1.0,

        0.0,0.0,
        1.0,1.0,
        0.0,1.0,


        0.0,0.0,
        1.0,0.0,
        0.0,1.0,

        1.0,0.0,
        0.0,1.0,
        1.0,1.0,


        0.0,0.0,
        1.0,0.0,
        1.0,1.0,

        0.0,0.0,
        1.0,1.0,
        0.0,1.0,


        0.0,0.0,
        1.0,0.0,
        1.0,1.0,

        0.0,0.0,
        1.0,1.0,
        0.0,1.0,
        

    ];


    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    
    gl.vertexAttribPointer(
        progInfos.texCoord,
        2, // nb val / coord
        gl.FLOAT, // type
        false, // normalize
        0, // stride
        0, // offset
    );
    
    gl.enableVertexAttribArray(progInfos.texCoord);  

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        gl.STATIC_DRAW,
    );

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(progInfos.uSampler, 0);
    
    var numFrame = 0;
    
    function render(now){
        numFrame += 1;
        draw(gl, progInfos, posBuffer, numFrame);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

var sens = 1.0;


function draw(gl, progInfo, posBuffer, numFrame){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(progInfo.prog);

    gl.uniform1f(progInfo.numFrame, numFrame);

    // les matrices: ça serait pas mieux de les gérer plus globalement ? là on les recalc à chaque fois
    // la modelview, oui, obligée ici vu comment on la trafique ensuite. HA HAHAHAHAHEZHHHQFHSDFHQDFHHAZEHFFHQSD
    const fieldOfView = (45 * Math.PI) / 180; 
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.1;

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    gl.uniformMatrix4fv(progInfo.projMat,false,projectionMatrix);

    // const modelViewMatrix = mat4.create();
    // mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -5.0]);
    // mat4.rotate(modelViewMatrix, modelViewMatrix, numFrame/50.0, [0.3, 0.4, 0.5]); 
    // gl.uniformMatrix4fv(progInfo.modViewMat,false,modelViewMatrix);
    // gl.drawArrays(gl.TRIANGLES, 0, 6);


    for(let y=0; y < 20; y++){
        for(let x=0; x < 40; x++){
            const modelViewMatrix = mat4.create();
            mat4.translate(modelViewMatrix, modelViewMatrix, [-50.0, -25.0, -40.0 + (20*(Math.sin(numFrame/30.0))) ]);
            mat4.translate(modelViewMatrix, modelViewMatrix, [3.0*x, 3.0*y, 0.0]);
            mat4.rotate(modelViewMatrix, modelViewMatrix, numFrame/50.0, [0.01 + (Math.sin(numFrame/30.0))/5.0, 0.02, 0.03]); 
            

            gl.uniformMatrix4fv(progInfo.modViewMat,false,modelViewMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 4*6);
        }
    }
    
    

}

main();