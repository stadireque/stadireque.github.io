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

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying vec4 vPos;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition ;
            vPos = gl_Position * 0.5 + 0.5;
        }
    `;


    // fragment
    const fsSource = `
    // float vec4 vPos;
    // highp vec4 vPos;

    // nécessaire sinon il râle qu'on n'a pas défini de précision sur les vec4 (on peut mettre highp,je suppose lowp)
    // precision mediump float; 
    precision lowp float; 

    varying vec4 vPos;

    void main() {
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_FragColor = vPos;
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
        projMat: gl.getUniformLocation(shaderProgram,"uProjectionMatrix"),
        modViewMat: gl.getUniformLocation(shaderProgram,"uModelViewMatrix")
    }

    // un buffer pour les vertices
    const vertices = [
            0.0, 0.0, 
            1.0, 0.0, 
            1.0, 1.0, 

            0.0, 0.0,
            -1.0, 0.0,
            -1.0, -1.0,
        ];

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var numFrame = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    gl.vertexAttribPointer(
        progInfos.vPos,
        2, // numComponents,
        gl.FLOAT, // type,
        false, //normalize,
        0, //stride,
        0 //offset,
    );

    gl.enableVertexAttribArray(progInfos.vPos);

    function render(now){
        numFrame += 0.1;
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

    // les matrices: ça serait pas mieux de les gérer plus globalement ? là on les recalc à chaque fois
    // la modelview, oui, obligée ici vu comment on la trafique ensuite. HA HAHAHAHAHEZHHHQFHSDFHQDFHHAZEHFFHQSD
    const fieldOfView = (45 * Math.PI) / 180; 
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.1;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


    const modelViewMatrix = mat4.create();
    mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, (-10 * Math.sin(numFrame))-15],
    );

    // la ptite rotation maison là
    mat4.rotate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to rotate
        numFrame, // amount to rotate in radians
        [0.0, 0.0, -1.0],
    ); 


    // c'est obligé que ça soit ici ça ? non, pas si on dessine toujours la même chose
    // gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    // gl.vertexAttribPointer(
    //     progInfo.vPos,
    //     2, // numComponents,
    //     gl.FLOAT, // type,
    //     false, //normalize,
    //     0, //stride,
    //     0 //offset,
    // );

    // gl.enableVertexAttribArray(progInfo.vPos);
    
    /// ici est tordue la tordeuze
    
    gl.uniformMatrix4fv(
        progInfo.projMat,
        false,
        projectionMatrix,
    );

    const savMat = modelViewMatrix;
    for(let c=0; c < 10; c++){
        // modelViewMatrix = savMat;
        mat4.translate(modelViewMatrix, modelViewMatrix, [2.0, 0.5, 0.0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, numFrame, [0.0, 0.0, 1.0]); 
        gl.uniformMatrix4fv(progInfo.modViewMat,false,modelViewMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    

}

main();