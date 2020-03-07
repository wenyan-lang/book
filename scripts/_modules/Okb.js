//   ____  _    _     
//  / __ \| |  | |    
// | |  | | | _| |__  
// | |  | | |/ / '_ \ 
// | |__| |   <| |_) |
//  \____/|_|\_\_.__/ .JS
//                    
// Procedural generation toolkit for Javascript - noises, randomness, curves, and more
// by Lingdong Huang


// index arrays with .x, .y, .z
if (("x" in []) || ("y" in []) || ("z" in [])){
  console.log("Warning: Failed to define xyz properties of Arrays, vectors might not work as expected.")
}else{
  Object.defineProperty(Array.prototype, "x", {
      get: function () {return this[0]},
      set: function (n) {this[0] = n},
  });
  Object.defineProperty(Array.prototype, "y", {
      get: function () {return this[1]},
      set: function (n) {this[1] = n},
  });
  Object.defineProperty(Array.prototype, "z", {
      get: function () {return this[2]},
      set: function (n) {this[2] = n},
  });
}


var Okb = new function(){var those = this;
  /** 
   * Utility for manipulating vectors in 2D/3D space.
   * Both Array-style and Object-with-xyz-fields style vectors are accepted, 
   * e.g.: `{x:1, y:2}`, `{x:1, y:2, z:3}`, `[1, 2, 3]`, `[1, 2]`
   * @property {Object} forward unit vector in positive z direction (0,0,1)
   * @property {Object} up unit vector in positive y direction (0,1,0)
   * @property {Object} right unit vector in positive x direction (1,0,0)
   */
  this.vector = new function(){var that = this;
    /** 
     * Create a new vector
     * @example
     * var v = vector.vector(1,2,42);        // {x:1, y:2, z:42}
     * var v = vector.vector(1,2);           // {x:1, y:2}
     * var v = vector.vector(1,2,42,[0,0,0]) // [1, 2, 42]
     * var v = vector.vector(1,2,42,[0,0])   // [1, 2]
     * @memberof vector
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {number} z the z coordinate, put `undefined` or omit the argument to create a 2D vector
     * @param {Object|number[]} like example vector, if specified, the generated vector will have the same dimension and data structure
     * @returns {Object|number[]} `[x,y(,z)]`|`{x:x,y:y(,z:z)}`
     */
    this.vector = function(x,y,z,like){
      var m = like
      if (m instanceof Array){
        return [x,y].concat((z != undefined && m.z != undefined) ? [z] : [])
      }else{
        var v = like == undefined ? {x:x,y:y} : Object.assign({},like,{x:x,y:y})
        if (z != undefined && (m == undefined || m.z != undefined)) {v.z = z};
        return v;
      }
    }
    function validate(v){
      return that.vector(
        v.x || 0,
        v.y || 0,
        v.z || 0,
      )
    }

    this.forward = that.vector(0,0,1)
    this.up = that.vector(0,1,0)
    this.right = that.vector(1,0,0)
    this.zero = that.vector(0,0,0)

    /** 
     * Rotate a vector around axis by an angle
     * @example
     * var v = vector.vector(1,2,3);                            // {x:1, y:2, z:3}
     * var u = vector.rotateAxial(v, vector.up, Math.PI/2);     // {x:3, y:2, z:-1}
     * var w = vector.rotateAxial([1,2,3], [0,1,0], Math.PI/2); // [3, 2, -1]
     * @memberof vector
     * @param {Object|number[]} vec the vector to rotate
     * @param {Object|number[]} axis a vector representing axis of rotation
     * @param {number} th the rotation angle in radians
     * @returns {Object|number[]} a new vector
     */
    this.rotateAxial = function(vec,axis,th){
      vec = validate(vec)
      var [l,m,n] = [axis.x, axis.y, axis.z]
      var [x,y,z] = [vec.x, vec.y, vec.z]
      var [cos,sin] = [Math.cos(th), Math.sin(th)]

      var mat={}
      mat[11]= l*l *(1-cos) +cos
      mat[12]= m*l *(1-cos) -n*sin
      mat[13]= n*l *(1-cos) +m*sin

      mat[21]= l*m *(1-cos) +n*sin
      mat[22]= m*m *(1-cos) +cos
      mat[23]= n*m *(1-cos) -l*sin

      mat[31]= l*n *(1-cos) -m*sin
      mat[32]= m*n *(1-cos) +l*sin
      mat[33]= n*n *(1-cos) +cos

      return that.vector(
        (x*mat[11] + y*mat[12] + z*mat[13]),
        (x*mat[21] + y*mat[22] + z*mat[23]),
        (x*mat[31] + y*mat[32] + z*mat[33]),
        vec
      )
    }
    
    /** 
     * Rotate vector by Euler angles z x y, in that order
     * @example
     * var v = vector.vector(1,2,3);                                  // {x:1, y:2, z:3}
     * var u = vector.rotateEuler(v, {x:Math.PI/2, y: Math.PI, z:0}); // {x:-1, y:-3, z:-2}
     * var w = vector.rotateEuler([1,2,3], [Math.PI/2, Math.PI, 0]);  // [-1, -3, -2]
     * @memberof vector
     * @param {Object|number[]} vec the vector to rotate
     * @param {Object|number[]} rot a vector containing the rotation angle for each axis in radians
     * @returns {Object|number[]} a new vector
     */
    this.rotateEuler = function(vec,rot){
      if (rot.z != 0) {vec = that.rotateAxial(vec,that.forward,rot.z)}
      if (rot.x != 0) {vec = that.rotateAxial(vec,that.right,rot.x)}
      if (rot.y != 0) {vec = that.rotateAxial(vec,that.up,rot.y)}
      return vec
    }
    /** 
     * Clone a vector
     * @example
     * var v = {x:1, y:2, z:3};
     * var u = vector.copy(v);  // {x:1, y:2, z:3}
     * var a = [1, 2]
     * var b = vector.copy(a);  // [1, 2]
     * v.x = 10;
     * console.log(u.x);        // 1
     * @memberof vector
     * @param {Object|number[]} vec the vector to copy
     * @returns {Object|number[]} a new vector
     */
    this.copy = function(vec){
      return that.vector(vec.x,vec.y,vec.z, vec)
    }
    /**
     * Resize vector by a scaler value
     * @memberof vector
     * @param {Object|number[]} vec the vector to scale
     * @param {number} p scaler factor
     * @returns {Object|number[]} a new vector
     */
    this.scale = function(vec,p){
      return that.vector(vec.x*p,vec.y*p,vec.z*p, vec)
    }
    /**
     * Elementwise summation for multiple vectors and/or scalers
     * @memberof vector
     * @param {...Object|number[]|number} arguments vectors and/or numbers to sum
     * @returns {Object|number[]} a new vector
     */
    this.add = function(){
      var v = that.vector(0,0,0,arguments[0]);
      for (var i = 0; i < arguments.length; i++){
        if (typeof(arguments[i]) == 'number'){
          v.x += arguments[i] || 0;
          v.y += arguments[i] || 0;
          if (v.z != undefined){
            v.z += arguments[i] || 0;
          }
        }else{
          v.x += arguments[i].x || 0;
          v.y += arguments[i].y || 0;
          if (v.z != undefined){
            v.z += arguments[i].z || 0;
          }
        }
      }
      return v
    }
    /**
     * Elementwise (Handamard) product for multiple vectors and/or scalers
     * @memberof vector
     * @param {...Object|number[]|number} arguments vectors and/or numbers to multiply
     * @returns {Object|number[]} a new vector
     */
    this.multiply = function(){
      var v = that.vector(1,1,1);
      for (var i = 0; i < arguments.length; i++){
        if (typeof(arguments[i]) == 'number'){
          v.x *= arguments[i] || 0;
          v.y *= arguments[i] || 0;
          v.z *= arguments[i] || 0;
        }else{
          v.x *= arguments[i].x || 0;
          v.y *= arguments[i].y || 0;
          v.z *= arguments[i].z || 0;
        }
      }
      return that.vector(v.x,v.y,v.z,arguments[0])
    }
    /**
     * Elementwise subtraction for two vectors
     * @memberof vector
     * @param {Object|number[]} u minuend vector
     * @param {Object|number[]} v subtrahend vector
     * @returns {Object|number[]} difference vector
     */
    this.subtract = function(u,v){
      var v0 = validate(u)
      v = validate(v)
      return that.vector(v0.x-v.x,v0.y-v.y,v0.z-v.z, u)
    }
    /**
     * Magnitude (norm) of a vector
     * @memberof vector
     * @param {Object|number[]} v a vector
     * @returns {number} its magnitude
     */
    this.magnitude = function(v){
      v = validate(v)
      return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
    }
    /**
     * Squared norm of a vector
     * @memberof vector
     * @param {Object|number[]} v a vector
     * @returns {number} ||v||^2
     */
    this.norm2 = function(v){
      v = validate(v)
      return v.x*v.x + v.y*v.y + v.z*v.z;
    }
    /**
     * Normalize (turn into unit) vector
     * @memberof vector
     * @param {Object|number[]} v a vector
     * @returns {number} a new vector, with same direction but magnitude of 1
     */
    this.normalize = function(v){
      var _v = v
      v = validate(v)
      var m = that.magnitude(v);
      if (m == 0){
        return that.vector(v.x,v.y,v.z, _v)
      }
      var p = 1/m
      return that.vector(v.x*p,v.y*p,v.z*p, _v)
    }
    /**
     * Lerp (linear-interpolation) between two vectors
     * @memberof vector
     * @param {Object|number[]} u a vector
     * @param {Object|number[]} v another vector
     * @param {number} t the interpolation (typically 0.0 to 1.0)
     * @returns {number} a new vector
     */
    this.lerp = function(u,v,t){
      var v0 = validate(u)
      var v1 = validate(v)
      return that.vector(v0.x*(1-t)+v1.x*t,v0.y*(1-t)+v1.y*t,v0.z*(1-t)+v1.z*t, u)
    }
    /**
     * Distance between vectors
     * @memberof vector
     * @param {...Object|number[]} arguments vectors
     * @returns {Object|number[]} a new vector
     */
    this.distance = function(){
      var acc = 0
      for (var i = 0; i < arguments.length-1; i++){
        var v0 = validate(arguments[i])
        var v1 = validate(arguments[i+1])
        acc += Math.sqrt(Math.pow(v0.x-v1.x,2) + Math.pow(v0.y-v1.y,2) + Math.pow(v0.z-v1.z,2))
      }
      return acc;
    }
    /**
     * Vector dot (inner) product
     * @memberof vector
     * @param {Object|number[]} u a vector
     * @param {Object|number[]} v another vector
     * @returns {number} the product
     */
    this.dot = function(u,v){
      u = validate(u)
      v = validate(v)
      return u.x*v.x + u.y*v.y + u.z*v.z 
    }
    /**
     * Vector cross (vector) product
     * @memberof vector
     * @param {Object|number[]} u a vector
     * @param {Object|number[]} v another vector
     * @returns {Object|number[]} a new vector
     */
    this.cross = function(u,v){
      var v0 = u;
      u = validate(u)
      v = validate(v)
      return that.vector(
        u.y*v.z - u.z*v.y,
        u.z*v.x - u.x*v.z,
        u.x*v.y - u.y*v.x,
        v0
      )
    }
    /**
     * Cosine of the angle between two vectors
     * @memberof vector
     * @param {Object|number[]} u a vector
     * @param {Object|number[]} v another vector
     * @returns {number} the cosine value
     */
    this.cosine = function(u,v){
      return that.dot(u,v)/(that.magnitude(u)*that.magnitude(v))
    }
    /**
     * Angle between two vectors
     * @memberof vector
     * @param {Object|number[]} u a vector
     * @param {Object|number[]} v another vector
     * @returns {number} the angle in radians
     */
    this.angle = function(u,v){
      return Math.acos(that.cosine(u,v))
    }
    /**
     * Elementwise map: apply same function to each element
     * @memberof vector
     * @param {Object|number[]} v a vector
     * @param {function} f the function to apply to each element
     * @returns {number} a new vector
     */
    this.elementwise = function(v,f){
      return that.vector(
        f(v.x),f(v.y),f(v.z),v
      )
    }
    /**
     * To matrix column, e.g. `[[x], [y], [z]]`
     * @memberof vector
     * @param {Object|number[]} v a vector
     * @returns {((number[])[])[]} `[[x], [y], [z]]`
     */
    this.toColumn = function(v){
      return [[v.x], [v.y], [v.z]]
    }
    /**
     * To matrix row, e.g. `[[x, y, z]]`
     * @memberof vector
     * @param {Object|number[]} v a vector
     * @returns {((number[])[])[]} `[[x, y, z]]`
     */
    this.toRow = function(v){
      return [[v.x, v.y, v.z]]
    }
  }

  /** 
   * Comprehensive collection of noises and randomness.
   */
  this.random = new function(){var that = this;

    var Lcg = function() {
      var m = 4294967296, a = 1664525, c = 1013904223, seed, z;
      return {
        setSeed : function(val) {
          z = seed = (val == null ? Math.random() * m : val) >>> 0;
        },
        getSeed : function() {return seed;},
        rand : function() { z = (a * z + c) % m; return z / m;}
      };
    };

    var PERLIN_YWRAPB = 4; var PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
    var PERLIN_ZWRAPB = 8; var PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
    var PERLIN_SIZE = 4095;
    var perlin_octaves = 4;var perlin_amp_falloff = 0.5;
    var scaled_cosine = function(i) {return 0.5*(1.0-Math.cos(i*Math.PI));};
    var p_perlin;
    /**
     * Perlin noise 3D
     * <br>(<a href="https://github.com/processing/p5.js/blob/master/src/math/noise.js">Reference</a>)
     * @memberof random
     * @param {number} x x-coordinate of the sample
     * @param {number} y y-coordinate of the sample (omit for a 1D noise)
     * @param {number} z z-coordinate of the sample (omit for a 2D noise)
     * @returns {number} noise value (from 0.0 to 1.0)
     */
    this.perlin = function(x,y,z) {
      y = y || 0; z = z || 0;
      if (p_perlin == null) {
        p_perlin = new Array(PERLIN_SIZE + 1);
        for (var i = 0; i < PERLIN_SIZE + 1; i++) {
          p_perlin[i] = Math.random();
        }
      }
      if (x<0) { x=-x; } if (y<0) { y=-y; } if (z<0) { z=-z; }
      var xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
      var xf = x - xi; var yf = y - yi; var zf = z - zi;
      var rxf, ryf;
      var r=0; var ampl=0.5;
      var n1,n2,n3;
      for (var o=0; o<perlin_octaves; o++) {
        var of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);
        rxf = scaled_cosine(xf); ryf = scaled_cosine(yf);
        n1  = p_perlin[of&PERLIN_SIZE];
        n1 += rxf*(p_perlin[(of+1)&PERLIN_SIZE]-n1);
        n2  = p_perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
        n2 += rxf*(p_perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
        n1 += ryf*(n2-n1);
        of += PERLIN_ZWRAP;
        n2  = p_perlin[of&PERLIN_SIZE];
        n2 += rxf*(p_perlin[(of+1)&PERLIN_SIZE]-n2);
        n3  = p_perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
        n3 += rxf*(p_perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
        n2 += ryf*(n3-n2);
        n1 += scaled_cosine(zf)*(n2-n1);
        r += n1*ampl;
        ampl *= perlin_amp_falloff;
        xi<<=1; xf*=2; yi<<=1; yf*=2; zi<<=1; zf*=2;
        if (xf>=1.0) { xi++; xf--; }
        if (yf>=1.0) { yi++; yf--; }
        if (zf>=1.0) { zi++; zf--; }
      }
      return r;
    };
    /**
     * Set amount of detail for `perlin()`
     * @memberof random
     * @param {number} lod level of detail
     * @param {number} falloff falloff
     */
    this.perlinDetail = function(lod, falloff) {
      if (lod>0)     { perlin_octaves=lod; }
      if (falloff>0) { perlin_amp_falloff=falloff; }
    };
    /**
     * Set seed for `perlin()`
     * @memberof random
     * @param {number} seed
     */
    this.perlinSeed = function(seed) {
      var lcg = Lcg();
      lcg.setSeed(seed);
      p_perlin = new Array(PERLIN_SIZE + 1);
      for (var i = 0; i < PERLIN_SIZE + 1; i++) {p_perlin[i] = lcg.rand();}
    };

    var SimplexNoise = undefined;
    var p_simplex = undefined;
    var p_perm = []
    /**
     * Set seed for `simplex()`
     * @memberof random
     * @param {number} seed the seed
     */
    this.simplexSeed = function(seed) {
      var lcg = Lcg();
      lcg.setSeed(seed);
      p_simplex = []
      for (var i = 0; i < 256; i++) {p_simplex[i] = Math.floor(lcg.rand()*256);}
      for(var i=0; i<512; i++) {
        p_perm[i]=p_simplex[i & 255];
      }
    };
    /**
     * Simplex noise 4D
     * <br>(<a href="http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf">Reference</a>)
     * @memberof random
     * @param {number} x x-coordinate of the sample
     * @param {number} y y-coordinate of the sample (omit for a 1D noise)
     * @param {number} z z-coordinate of the sample (omit for a 2D noise)
     * @param {number} w w-coordinate of the sample (omit for a 3D noise)
     * @returns {number} noise value (from 0.0 to 1.0)
     */
    this.simplex = function(x,y,z,w){
      x = (x!=undefined) ? Math.abs(x) : 0
      y = (y!=undefined) ? Math.abs(y) : 0
      z = (z!=undefined) ? Math.abs(z) : 0
      w = (w!=undefined) ? Math.abs(w) : 0
      if (p_simplex == undefined){
        that.simplexSeed((new Date()).getTime());
      }
      if (SimplexNoise == undefined){
        SimplexNoise = new function (){
          var grad4= [[0,1,1,1], [0,1,1,-1], [0,1,-1,1], [0,1,-1,-1], [0,-1,1,1], [0,-1,1,-1], [0,-1,-1,1], [0,-1,-1,-1],
                      [1,0,1,1], [1,0,1,-1], [1,0,-1,1], [1,0,-1,-1], [-1,0,1,1], [-1,0,1,-1], [-1,0,-1,1], [-1,0,-1,-1],
                      [1,1,0,1], [1,1,0,-1], [1,-1,0,1], [1,-1,0,-1], [-1,1,0,1], [-1,1,0,-1], [-1,-1,0,1], [-1,-1,0,-1], 
                      [1,1,1,0], [1,1,-1,0], [1,-1,1,0], [1,-1,-1,0], [-1,1,1,0], [-1,1,-1,0], [-1,-1,1,0], [-1,-1,-1,0]];

          var lookup =  [[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
                         [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
                         [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
                         [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
                         [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
                         [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
                         [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
                         [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]];
          function dot(g, x, y,  z, w) { return g[0]*x + g[1]*y + g[2]*z + g[3]*w; }
          // 4D simplex noise
          this.noise = function(x,y,z,w) {
            var perm = p_perm;
            var F4 = (Math.sqrt(5.0)-1.0)/4.0;
            var G4 = (5.0-Math.sqrt(5.0))/20.0;
            var n0, n1, n2, n3, n4;
            var s = (x + y + z + w) * F4; 
            var i = Math.floor(x + s);
            var j = Math.floor(y + s);
            var k = Math.floor(z + s); 
            var l = Math.floor(w + s);
            var t = (i + j + k + l) * G4;
            var X0 = i - t;
            var Y0 = j - t;
            var Z0 = k - t;
            var W0 = l - t;
            var x0 = x - X0;
            var y0 = y - Y0;
            var z0 = z - Z0;
            var w0 = w - W0;
            var c1 = (x0 > y0) ? 32 : 0;
            var c2 = (x0 > z0) ? 16 : 0;
            var c3 = (y0 > z0) ? 8 : 0;
            var c4 = (x0 > w0) ? 4 : 0;
            var c5 = (y0 > w0) ? 2 : 0;
            var c6 = (z0 > w0) ? 1 : 0;
            var c = c1 + c2 + c3 + c4 + c5 + c6;
            var i1, j1, k1, l1;
            var i2, j2, k2, l2; 
            var i3, j3, k3, l3; 
            i1 = lookup[c][0]>=3 ? 1 : 0;
            j1 = lookup[c][1]>=3 ? 1 : 0;
            k1 = lookup[c][2]>=3 ? 1 : 0;
            l1 = lookup[c][3]>=3 ? 1 : 0;
            i2 = lookup[c][0]>=2 ? 1 : 0;
            j2 = lookup[c][1]>=2 ? 1 : 0;
            k2 = lookup[c][2]>=2 ? 1 : 0;
            l2 = lookup[c][3]>=2 ? 1 : 0;
            i3 = lookup[c][0]>=1 ? 1 : 0;
            j3 = lookup[c][1]>=1 ? 1 : 0;
            k3 = lookup[c][2]>=1 ? 1 : 0;
            l3 = lookup[c][3]>=1 ? 1 : 0;
            var x1 = x0 - i1 + G4;
            var y1 = y0 - j1 + G4;
            var z1 = z0 - k1 + G4;
            var w1 = w0 - l1 + G4;
            var x2 = x0 - i2 + 2.0*G4;
            var y2 = y0 - j2 + 2.0*G4;
            var z2 = z0 - k2 + 2.0*G4;
            var w2 = w0 - l2 + 2.0*G4;
            var x3 = x0 - i3 + 3.0*G4;
            var y3 = y0 - j3 + 3.0*G4;
            var z3 = z0 - k3 + 3.0*G4;
            var w3 = w0 - l3 + 3.0*G4;
            var x4 = x0 - 1.0 + 4.0*G4;
            var y4 = y0 - 1.0 + 4.0*G4;
            var z4 = z0 - 1.0 + 4.0*G4;
            var w4 = w0 - 1.0 + 4.0*G4;
            var ii = i & 255;
            var jj = j & 255;
            var kk = k & 255;
            var ll = l & 255;
            var gi0 = perm[ii+perm[jj+perm[kk+perm[ll]]]] % 32;
            var gi1 = perm[ii+i1+perm[jj+j1+perm[kk+k1+perm[ll+l1]]]] % 32; 
            var gi2 = perm[ii+i2+perm[jj+j2+perm[kk+k2+perm[ll+l2]]]] % 32; 
            var gi3 = perm[ii+i3+perm[jj+j3+perm[kk+k3+perm[ll+l3]]]] % 32; 
            var gi4 = perm[ii+1+perm[jj+1+perm[kk+1+perm[ll+1]]]] % 32;
            var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0 - w0*w0; 
            if(t0<0){
              n0 = 0.0;
            } else {
              t0 *= t0;
              n0 = t0 * t0 * dot(grad4[gi0], x0, y0, z0, w0); 
            }
            var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1 - w1*w1; 
            if(t1<0) {
              n1 = 0.0;
            } else {
              t1 *= t1;
              n1 = t1 * t1 * dot(grad4[gi1], x1, y1, z1, w1); 
            }
            var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2 - w2*w2; 
            if(t2<0){
              n2 = 0.0;
            } else {
              t2 *= t2;
              n2 = t2 * t2 * dot(grad4[gi2], x2, y2, z2, w2); 
            }
            var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3 - w3*w3; 
            if(t3<0){
              n3 = 0.0;
            }else {
              t3 *= t3;
              n3 = t3 * t3 * dot(grad4[gi3], x3, y3, z3, w3); 
            }
            var t4 = 0.6 - x4*x4 - y4*y4 - z4*z4 - w4*w4; 
            if(t4<0){
              n4 = 0.0;
            }else {
              t4 *= t4;
              n4 = t4 * t4 * dot(grad4[gi4], x4, y4, z4, w4); 
            }
            return 27.0 * (n0 + n1 + n2 + n3 + n4);
          }
        }
      }
      return SimplexNoise.noise(x,y,z,w)*0.5+0.5
    }


    var p_plasma = []
    var plasma_lcg = undefined;
    /**
     * Set seed for `plasma()`
     * @memberof random
     * @param {number} seed
     */
    this.plasmaSeed = function(seed){
      plasma_lcg = Lcg();
      plasma_lcg.setSeed(seed);
    }
    /**
     * Plasma (Diamond-Square) noise 2D
     * @example
     * // prepare a 257x257 matrix containing the diamond-square noise
     * var map = random.plasma(8) ;
     * // get the noise value at x=0.3, y=0.5
     * var z = map(0.3,0.5);
     * @memberof random
     * @param {Object} args arguments
     * @param {number} [args.n=7] resolution = `2^n+1` x `2^n+1`
     * @param {number} [args.detail=1] level of detail
     * @returns {function} `f` where `f(x, y)` evaluates to the noise value (0-1) at `0<=x<=1` and `0<=y<=1`
     */
    this.plasma = function(args){
      args = (args != undefined) ? args : {}
      var n = (args.n!=undefined) ? args.n : 1
      var detail = (args.detail!=undefined) ? args.detail : 7

      if (plasma_lcg == undefined){
        that.plasmaSeed((new Date()).getTime());
      }
      var size = Math.pow(2,n)
      var dim = size + 1
      var arr = [];
      var min = Infinity;
      var max = -Infinity;
      for (var i = 0; i < dim; i++){
        arr.push([])
        for (var j = 0; j < dim; j++){
          arr[i].push(0);
        }
      }
      function average(l){
        var sum = 0
        for (var i=0; i< l.length; i++){
          if (l[i]){
          sum = sum + l[i]}
        }
        return sum/(l.length)
      }

      function aget(x,y){
        try{
          return arr[y][x]
        }catch(e){
          return 0
        }
      }
      function aset(x,y,v){
        if (v < min){
          min = v;
        }
        if (v > max){
          max = v;
        }
        arr[y][x]=v
      }
      function square(x,y,size){
        var ave =average([aget(x-size,y-size),aget(x+size,y-size),
                          aget(x+size,y+size),aget(x-size,y+size)])
        aset(x,y, ave + (plasma_lcg.rand() * 2 - 1) * Math.pow(size, detail))
      }

      function diamond(x,y,size){
        var ave =average([aget(x,y-size),aget(x+size,y),
                          aget(x,y+size),aget(x-size,y)]);
        aset(x,y, ave + (plasma_lcg.rand() * 2 - 1) * Math.pow(size, detail))
      }

      function diamondSquare(size,maxsize){
        var x, y, half = size / 2;
        if (half < 1) {return}
        for (y = half; y < maxsize; y += size) {
          for (x = half; x < maxsize; x += size) {
            square(x, y, half);
          }
        }
        for (y = 0; y <= maxsize; y += half) {
          for (x = (y + half) % size; x <= maxsize; x += size) {
            diamond(x, y, half);
          }
        }
        return diamondSquare(size / 2,maxsize);
      }
      diamondSquare(size,size)
      var range = max-min
      return function(x,y){
        return (arr[Math.floor(Math.abs(y%2-1)*size)][Math.floor(Math.abs(x%2-1)*size)]-min)/range
      }
    }

    var _value_noise_seed = 0;
    /**
     * Set seed for `valueNoise()`
     * @memberof random
     * @param {number} seed
     */
    this.valueNoiseSeed = function(seed){
      _value_noise_seed = seed;
    }
    /**
     * Value noise 3D
     * <br>(<a href="http://www.iquilezles.org/www/articles/morenoise/morenoise.htm">Reference</a>)
     * @memberof random
     * @param {number} x x-coordinate of the sample
     * @param {number} y y-coordinate of the sample (omit for a 1D noise)
     * @param {number} z z-coordinate of the sample (omit for a 2D noise)
     * @returns {number} noise value (from 0.0 to 1.0)
     */
    this.valueNoise = function( x, y, z ){
      x = (x!=undefined) ? Math.abs(x) : 0
      y = (y!=undefined) ? Math.abs(y) : 0
      z = (z!=undefined) ? Math.abs(z) : 0
      function _hash(x,y,z){
        var modf = (x)=>(x-Math.floor(x))
        return 0.5+0.5*modf(((x+0.12)*(y+0.34)*(z+0.56)*(x+y-z))*Math.PI+_value_noise_seed*Math.E);
      }
      var px = Math.floor(x);
      var py = Math.floor(y);
      var pz = Math.floor(z);
      var wx = x-px;
      var wy = y-py;
      var wz = z-pz;

      var ux = wx*wx*(3-2*wx)
      var uy = wy*wy*(3-2*wy)
      var uz = wz*wz*(3-2*wz)

      var a = _hash( px,  py,  pz)
      var b = _hash( px+1,py,  pz)
      var c = _hash( px,  py+1,pz)
      var d = _hash( px+1,py+1,pz)
      var e = _hash( px,  py,  pz+1 );
      var f = _hash( px+1,py,  pz+1 );
      var g = _hash( px,  py+1,pz+1 );
      var h = _hash( px+1,py+1,pz+1 );

      var k0 =   a;
      var k1 =   b - a;
      var k2 =   c - a;
      var k3 =   e - a;
      var k4 =   a - b - c + d;
      var k5 =   a - c - e + g;
      var k6 =   a - b - e + f;
      var k7 = - a + b + c - d + e - f - g + h;

      return -1.0+2.0*(k0 + k1*ux +  k2*uy + k3*uz + k4*ux*uy + k5*uy*uz + k6*uz*ux + k7*ux*uy*uz)
    }

    /**
     * Fractal Brownian motion (fBm)
     * <br>(<a href="http://www.iquilezles.org/www/articles/morenoise/morenoise.htm">Reference</a>)
     * @example
     * // fractal version of perlin noise with 3 octaves, sampled at (42, 84, 13)
     * var z = fractal (perlin, {octaves: 3}) (42, 84, 13);
     * @memberof random
     * @param {function} func another noise function `func(x,y,z):number` to apply fBm to
     * @param {Object} args arguments
     * @param {number} [args.f=1.98] f parameter
     * @param {number} [args.s=0.49] s parameter
     * @param {number} [args.b=0.5] b parameter
     * @param {number} [args.octaves=2] number of octaves
     * @returns {function} `f` where `f(x, y, z)` evaluates to the noise value (0-1) at `(x, y, z)`
     */
    this.fractal = function(func, args){
      args = (args != undefined) ? args : {}
      var f = (args.f!=undefined) ? args.f : 1.98
      var s = (args.s!=undefined) ? args.s : 0.49
      var b = (args.b!=undefined) ? args.b : 0.5
      var octaves = (args.octaves!=undefined) ? args.octaves : 2

      var m = [[1.0,0.0,0.0],[0.0,1.0,0.0],[0.0,0.0,1.0]]
      var m3 = [[0.00,  0.80,  0.60],[-0.80,  0.36, -0.48],[-0.60, -0.48,  0.64]];

      return function(x,y,z){
        x = (x!=undefined) ? x : 0
        y = (y!=undefined) ? y : 0
        z = (z!=undefined) ? z : 0
        var a = 0.0
        for (var i = 0; i < octaves; i++){
          var n = func(x,y,z)
          a += b*n
          b *= s        
          var _x = f*(m3[0][0]*x+m3[0][1]*y+m3[0][2]*z)
          var _y = f*(m3[1][0]*x+m3[1][1]*y+m3[1][2]*z)
          var _z = f*(m3[2][0]*x+m3[2][1]*y+m3[2][2]*z)
          x = _x;
          y = _y;
          z = _z;
        }
        return a;
      }
    }

    var prng_s = 1234
    var prng_p = 999979
    var prng_q = 999983
    var prng_m = prng_p*prng_q
    var prng_hash = function(x){
      function _btoa(str) {
        try{
          var buffer;
          if (str instanceof Buffer) {
            buffer = str;
          } else {
            buffer = Buffer.from(str.toString(), 'binary');
          }
          return buffer.toString('base64');
        }catch(e){
          return btoa(str)
        }
      }
      var y = _btoa(JSON.stringify(x)); var z = 0
      for (var i = 0; i < y.length; i++){
        z += y.charCodeAt(i)*Math.pow(128,i)}
      return z
    }
    /**
     * Set seed for `random()`, a seeded pseudo random number generator (PRNG)
     * @memberof random
     * @param {number|string} seed the seed
     */
    this.randomSeed = function(seed){
      var x = seed;
      if (x == undefined) {x = (new Date()).getTime()}
      var y = 0; var z = 0;
      function redo(){y = (prng_hash(x)+z) % prng_m; z+=1}
      while (y % prng_p == 0 || y % prng_q == 0 || y == 0 || y == 1){redo()}
      prng_s = y
      for (var i = 0; i < 10; i++){that.random();}
    }
    /**
     * Get next sample for the seeded random number generator
     * @memberof random
     * @returns {number} random value (from 0.0 to 1.0)
     */
    this.random = function(){
      prng_s = (prng_s * prng_s) % prng_m
      return prng_s/prng_m
    }
    /**
     * Set seed for all noises and random generators
     * @memberof random
     * @param {number} seed
     */
    this.seed = function(seed){
      this.randomSeed(seed);
      this.perlinSeed(seed);
      this.plasmaSeed(seed);
      this.simplexSeed(seed);
      this.valueNoiseSeed(seed);
    }
    /**
     * Overwrite JavaScript defualt `Math.random()` with `random()`,
     * and add `Math.randomSeed()` for seeding to `Math`
     * @memberof random
     */
    this.overwriteDefault = function(){
      Math.randomSeed = this.randomSeed;
      Math.random = this.random;
    }
    /**
     * Generate a random float between two numbers
     * @memberof random
     * @param {number} lo lower bound
     * @param {number} hi upper bound
     * @returns {number} random value
     */
    this.normalized = function(lo,hi){
      return those.math.map(Math.random(),0,1,lo,hi);
    }
    /**
     * Weighted random number generator: 
     * probability of returning a number is proportional to the output of input function evaluated at that number
     * @example
     * var y = weighted((x)=>(x*x))
     * console.log(y) // much more likely to be closer to 1 than to 0
     * @memberof random
     * @param {function} f `Pr(x) = k * f(x)`, where `0 <= x <= 1`,` k > 0`
     * @returns {number} random value (from 0.0 to 1.0)
     */
    this.weighted = function(f){
      var x = Math.random()
      var y = Math.random()
      if (y<f(x)){
        return x
      }else{
        return that.weighted(f)
      }
    }
    /**
     * Weighted random number generator 3D: 
     * probability of returning a point is proportional to the output of input function evaluated at that point
     * @example
     * var y = weighted3d((x,y,z)=>(x*y*z))
     * console.log(y)
     * @memberof random
     * @param {function} f `Pr(A) = k * f(x,y,z)`, where `A=(x,y,z) in [0, 1] x [0, 1] x [0, 1]`, `k > 0`
     * @returns {Object} random point in `[0, 1] x [0, 1] x [0, 1]`
     */
    this.weighted3d = function(f){
      var x = Math.random()
      var y = Math.random()
      var z = Math.random()
      var w = Math.random()
      if (w<f(x,y,z)){
        return {x:x,y:y,z:z}
      }else{
        return that.weighted3d(f)
      }
    }
    /**
     * Gaussian randomness: random number fitting a Gaussian (normal) distribution
     * @memberof random
     * @returns {Object} random value from 0.0 to 1.0 where 0.5 has the peak probability
     */
    this.gaussian = function(){
      return that.weighted(those.curves.gaussian)
    }

    /**
     * Shuffle an array in place using Fisher–Yates algorithm
     * <br>(<a href="https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array">Reference</a>)
     * @memberof random
     * @param {Array} a the array to shuffle
     */
    this.shuffle = function(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
      }
      return a;
    }
    /**
     * Pick random element from array
     * @memberof random
     * @param {Array} the array to choose from
     * @returns {Object} the randomly chosen element
     */
    this.choice = function(arr) {
      return arr[Math.floor(arr.length * Math.random())];
    }
    /**
     * Loop-able noise on x-axis
     * @memberof random
     * @example
     * loopNoise = pt.random.loopNoise
     * var a = loopNoise(10)(5)
     * var b = loopNoise(10)(15)
     * console.log(Math.abs(a-b) < 0.01) // true
     * var c = loopNoise(10)(9.99)
     * var d = loopNoise(10)(10.01)
     * console.log(Math.abs(c-d) < 0.1) // true
     * @param {number} width length of the loop, around which the x-axis of the noise will wrap
     * @returns {function} `f` where `f(x, y, z)` evaluates to the noise value (0-1) at `(x, y, z)`
     */
    this.loopNoise = function(width){
      var r = (width/2)/Math.PI
      var da = ((Math.PI*2)/width)
      return function(x,y,z){
        x = (x!=undefined) ? x : 0
        y = (y!=undefined) ? y : 0
        z = (z!=undefined) ? z : 0
        var a = da * x;
        var nx = Math.cos(a) * r;
        var ny = Math.sin(a) * r;
        return that.perlin(r+nx+z,r+ny+z,y)
      }
    }
    /**
     * Tile-able noise on xy-plane
     * @example
     * // 64x64 tile-able noise sampled at `x=13`, `y=42`
     * var z = random.tileNoise(64,64)(13,42)
     * @memberof random
     * @param {number} width width of a tile, around which the x-axis of the noise will wrap
     * @param {number} height height of a tile, around which the y-axis of the noise will wrap
     * @returns {function} `f` where `f(x, y, z)` evaluates to the noise value (0-1) at `(x, y, z)`
     */
    this.tileNoise = function(width,height){
      var rx = (width/2)/Math.PI
      var ry = (height/2)/Math.PI
      var dax = ((Math.PI*2)/width)
      var day = ((Math.PI*2)/height)
      return function(x,y,z){
        x = (x!=undefined) ? x : 0
        y = (y!=undefined) ? y : 0
        z = (z!=undefined) ? z : 0
        var ax = dax * x;
        var ay = day * y;
        var nx = Math.cos(ax) * rx;
        var ny = Math.sin(ax) * rx;
        var mx = Math.cos(ay) * ry;
        var my = Math.sin(ay) * ry;
        return that.simplex(rx+nx+z, rx+ny+z, ry+mx+z, ry+my+z);
      }
    }
    /**
     * Blue (Poisson-disk) noise
     * @example
     * // Initialize a 3D blue noise
     * var getNoise = blue({dimension:3, iteration: 30});
     * // generate new data points that spread evenly among previous points
     * for (var i = 0; i < 100; i++){
     *    var p = getNoise();
     *    // do something with p
     * }
     * @memberof random
     * @param {Object} args arguments
     * @param {number} [args.dimension=2] number of dimensions for the sample space (1|2|3|...)
     * @param {number} [args.iteration=20] number of candidates to compare at each step
     * @param {function} args.sampler random function to use for sampling, default is an n-dimensional `Math.random()`.
     * A non-uniform one can be used to create patterns
     * @returns {function} `f` where `f()` evaluates to the next sample
     */
    this.blue = function(args){
      args = (args != undefined) ? args : {}
      var dimension = (args.dimension != undefined) ? args.dimension : 2;
      var iteration = (args.iteration != undefined) ? args.iteration : 20;
      var sampler = (args.sampler != undefined) ? args.sampler : function(){
        if (dimension == 1){
          return {x:Math.random(), y:0, z:0}
        }else if (dimension == 2){
          return {x:Math.random(), y:Math.random(), z:0}
        }else if (dimension == 3){
          return {x:Math.random(), y:Math.random(), z:Math.random()}
        }
      }
      var dots = []
      return function(){
        var candidates = []
        for (var i = 0; i < iteration; i++){
          candidates.push(sampler())
        }
        var maxind = 0;
        var maxdist = 0;
        for (var i = 0; i < candidates.length; i++){
          var shortdist = Infinity;
          for (var j = 0; j < dots.length; j++){
            var d = those.vector.distance(dots[j],candidates[i])
            if (d < shortdist){
              shortdist = d;
            }
          }
          if (shortdist > maxdist){
            maxdist = shortdist;
            maxind = i;
          }
        }
        dots.push(candidates[maxind])
        return candidates[maxind]
      }
    }


  }
  /** 
   * Collection of functions and curves for modelling smooth shapes and motions
   */
  this.curves = new function(){var that = this;

    var pow = Math.pow;
    var exp = Math.exp;
    var cos = Math.cos;
    var sin = Math.sin;

    /**
     * Gaussian (Normal) distribution with mean 0.5 and stadard deviation of 1/3
     * @memberof curves
     * @param {number} x `0<=x<=1`
     * @returns {number} `y` `0<=y<=1`
     */
    this.gaussian = function(x){
      return pow(Math.E,-18*pow(x-0.5,2));
    }
    /**
     * 2D Gaussian
     * @memberof curves
     * @param {number} x `0<=x<=1`
     * @param {number} y `0<=y<=1`
     * @returns {number} `z` `0<=y<=1`
     */
    this.gaussian2d = function(x,y){
      var sig = 1/5;
      return Math.exp(-Math.pow(x-0.5,2)/(2*sig*sig)-Math.pow(y-0.5,2)/(2*sig*sig))  
    }
    /**
     * Sigmoid curve
     * @memberof curves
     * @param {number} x `0<=x<=1`
     * @param {number} [k=10] constant
     * @returns {number} `y` `0<=y<=1`
     */
    this.sigmoid = function(x,k){
      k = (k != undefined) ? k : 10
      return 1/(1+exp(-k*(x-0.5)))
    }
    /**
     * Inverse sigmoid curve (Reflection of sigmoid curve about y=x)
     * @memberof curves
     * @param {number} x `0<=x<=1`
     * @param {number} [k=10] constant
     * @returns {number}
     */
    this.inverseSigmoid = function(x,k){
       k = (k != undefined) ? k : 10
      return (-0.1 * Math.log(0.00673795*(1/x-1))-0.5)*(k/10)+0.5
    }
    /**
     * (Pseudo) bean curve, a non-parametric approximation of the bean curve
     * @memberof curves
     * @param {number} x `0<=x<=1`
     * @returns {number} `y` `0<=y<=1`
     */
    this.bean = function(x){
      return pow(0.25-pow(x-0.5,2),0.5)*(2.6+2.4*pow(x,1.5))*0.54
    }
    /**
     * Function interpolating between square and circle
     * @example
     * for (var i = 0; i < 360; i++){
     *   var th = i * Math.PI / 180
     *   var r = squircle (1, 8) (th)
     *   var [x, y] = [r * Math.cos(th), r * Math.sin(th)]
     * }
     * @memberof curves
     * @param {number} r radius of the circle
     * @param {number} a "square-ness", `a=2` is perfect circle, `a=10` is a square with rounded corners, `a>30` is almost a square
     * @param {number} [k=10] constant
     * @returns {function} `f` where `f(th)` evaluates to radius at angle `th` (radians)
     */
    this.squircle = function(r,a){
      return function(th){
        while (th > Math.PI/2){
          th -= Math.PI/2
        }
        while (th < 0){
          th += Math.PI/2
        }
        return r*pow(1/(pow(cos(th),a)+pow(sin(th),a)),1/a)
      }
    }
    /**
     * Rational quadratic Bézier curve (Quadratic Bezier curve with custom weight on vertices)
     * <br>(<a href="https://en.wikipedia.org/wiki/Bézier_curve#Rational_Bézier_curves">Reference</a>)
     * @memberof curves
     * @param {Object|number[]} p0 first point (`[x,y(,z)]`|`{x:x,y:y(,z:z)}`)
     * @param {Object|number[]} p1 second (handle) point
     * @param {Object|number[]} p2 end point
     * @param {number} [w=2] weight `>0`, `w=0.5` very smooth curve, `w=1` standard bezier curve, `w>3` only subtle smoothing occur
     * @param {number} t `0<=t<=1` the parameter
     * @returns {Object|Array} the point at `t`
     */
    this.rationalQuadraticBezier = function(p0, p1, p2, w, t){
      if (w == undefined) {w = 2};
      var u = (pow (1 - t, 2) + 2 * t * (1 - t) * w + t * t);
      return those.vector.vector(
        (pow(1-t,2)*p0.x+2*t*(1-t)*p1.x*w+t*t*p2.x)/u,
        (pow(1-t,2)*p0.y+2*t*(1-t)*p1.y*w+t*t*p2.y)/u,
        (pow(1-t,2)*p0.z+2*t*(1-t)*p1.z*w+t*t*p2.z)/u,
        p0
      );
    }
    /**
     * Higher-order Bézier curve (quadratic, cubic, quartic, quintic, ...)
     * @memberof curves
     * @param {(Object|number[])[]} P array of points, `P.length` determines the order, e.g. `P.length=3` is a cubic bezier curve
     * @param {number} t `0<=t<=1` the parameter
     * @returns {Object|number[]} the point at `t`
     */
    this.highBezier = function(P,t){
      if (P.length == 1){
        return P[0]
      }else if (P.length == 2){
        return those.vector.lerp(P[0],P[1],t)
      }else{
        return those.vector.lerp(that.highBezier(P.slice(0,P.length-1), t), 
                                 that.highBezier(P.slice(1), t), t)
      }
    }
    /**
     * Smooth a polyline (using rational bézier)
     * @memberof curves
     * @param {(Object|number[])[]} P array of points representing the polyline
     * @param {Object} args arguments
     * @param {number} [args.weight=1] higher the weight, less smoothing
     * @param {number} [args.detail=20] number of subdivisions for each segment
     * @returns {(Object|number[])[]} a new array of points
     */
    this.smoothen = function(P, args){
      args = (args != undefined) ? args : {}
      var w = (args.weight != undefined)  ?  args.weight : 1;
      var n = (args.detail != undefined) ?   args.detail : 20;
      if (P.length == 2){
        P = [P[0],those.geometry.midpoint(P[0],P[1]),P[1]];
      }
      var plist = [];
      for (var j = 0; j < P.length-2; j++){
        var p0; var p1; var p2;
        if (j == 0){p0 = P[j];}else{p0 = those.geometry.midpoint(P[j],P[j+1]);}
        p1 = P[j+1];
        if (j == P.length-3){p2 = P[j+2];}else{p2 = those.geometry.midpoint(P[j+1],P[j+2]);}
        var pl = n;
        for (var i = 0; i < pl+(j==P.length-3); i+= 1){
          var t = i/pl;
          plist.push(that.rationalQuadraticBezier(p0,p1,p2,w,t));
        }
      }
      return plist;
    }

    /**
     * Fit a smooth, continuous function to a set of data points.
     * @example
     * fit([[0,0],[1,1]]) (0.6)            // 0.6
     * fit([[0,0],[0.5,0.2],[1,1]]) (0.6)  // 0.42
     * @memberof curves
     * @param {(Object|number[])[]} P array of points
     * @param {Object} args arguments
     * @param {number} [args.smooth=0.5] amount of smoothing (0-1)
     * @param {number} [args.detail=20] precision for curve (number of subdivisions between adjacent points)
     * @returns {function} `f` where `f(x)` returns the value of the function at `x`
     */
    this.fit = function(P, args){
      args = (args != undefined) ? args : {}
      var s = (args.smooth != undefined)  ?  args.smooth : 0.5;
      var plist = P;
      if (args.smooth != 0){
        plist = that.smoothen(P, {weight:those.math.map(s,0,1,3,0.5), detail:args.detail});
      }
      plist.sort((a,b)=>(a.x-b.x))
      return function(x){
        for (var i = 1; i < plist.length; i++){
          if (x < plist[i].x){
            var r = (x-plist[i-1].x)/(plist[i].x-plist[i-1].x);
            return those.math.lerp(plist[i-1].y,plist[i].y,r);
          }
        }
        return 0;
      }
    }
  }
  /** 
   * Supplemental arithmetic utilities
   */
  this.math = new function(){var that = this;
    /**
     * Re-map numbers from one range to another
     * <br>(<a href="https://github.com/processing/processing/blob/master/core/src/processing/core/PApplet.java">Reference</a>)
     * @memberof math
     * @param {number} value the incoming value to be converted
     * @param {number} istart domain lower bound
     * @param {number} istop domain upper bound
     * @param {number} ostart range lower bound
     * @param {number} ostop range upper bound
     * @returns {number} re-mapped value
     */
    this.map = function(value,istart,istop,ostart,ostop){
      return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
    }
    /**
     * Interpolation between numbers using a custom curve
     * @example
     * //linear lerp
     * interpolate ((x)=>(x)) (13, 42, 0.8); // 36.2
     * //sigmoid lerp
     * interpolate (curves.sigmoid) (13, 42, 0.8); // 40.6
     * //quadratic lerp
     * interpolate ((x)=>(x*x)) (13, 42, 0.8); // 31.6
     * @memberof math
     * @param {function} f function for the curve
     * @returns {function} `g` where `g(a,b,t)` interpolates between numbers `a` and `b` using value of `f(t)`.
     */
    this.interpolate = function(f){
      return function(a,b,t){
        var s = f(t);
        return a*(1-s) + b*s
      }
    }
    /**
     * Linear interpolation between numbers
     * @memberof math
     * @param {number} a the first number
     * @param {number} b the second number
     * @param {number} t amount of interpolation (0-1)
     * @returns {number} interpolated number
     */
    this.lerp = that.interpolate((x)=>(x))
    
    /**
     * Normalize angle to interval `]–π,π]`
     * @memberof math
     * @param {number} x any number
     * @returns {number} `y` where `-π < y <= π`
     */                         
    this.normalizePlusMinusPi = function(x){
      if (-Math.PI < x && x <= Math.PI){
        return x;
      }
      while (x <= -Math.PI){
        x += Math.PI*2
      }
      while (x > Math.PI){
        x -= Math.PI*2
      }
      return x;
    }                         
    
    /**
     * Matrix multiplication
     * <br>(<a href="https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript">Reference</a>)
     * @memberof math
     * @param {(number[])[]} m1 first matrix
     * @param {(number[])[]} m2 second matrix
     * @returns {number} matrix product
     */
    this.matrixMultiply = function(m1, m2) {
      var result = [];
      for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
          var sum = 0;
          for (var k = 0; k < m1[0].length; k++) {
            sum += m1[i][k] * m2[k][j];
          }
          result[i][j] = sum;
        }
      }
      return result;
    }
    /**
     * Solve system of linear equations (using Gauss-Jordan elimination)
     * @memberof math
     * @param {(number[])[]} m a row-major matrix containing the system
     * @returns {number[]|string} if there is a unique solution, return it (`[x0,x1,x2,...]`), otherwise return `"underdetermined"` or `"overdetermined"`
     */
    this.solveLinearSystem = function(m){
      function iszero(x){
        return Math.abs(x)<0.0001;
      }
      function multrow(r,s){
        return r.map(x=>x*s)
      }
      function addrow(r0,r1){
        return r0.map((x,i)=>(x+r1[i]))
      }
      function elimrow(ind,r0,r1){
        var p = -r1[ind]/r0[ind]
        var r = addrow(r1,multrow(r0,p))
        if (r.slice(0,-1).filter(x=>(x!=0)).length == 0){
          if (r[r.length-1] == 0){
            return "underdetermined"
          }else{
            return "overdetermined"
          }
        }
        return r
      }
      function countLeadZero(r){
        var counter = 0;
        for (var i = 0; i < r.length; i++){
          if (iszero(r[i])){
            counter += 1;
          }else{
            break;
          }
        }
        return counter;
      }
      function reorder(m){
        var M = m.slice();
        M.sort((a,b)=>(countLeadZero(a)-countLeadZero(b)));
        return M
      }
      function solve(m){
        function isech(){
          for (var i = 0; i < m.length; i++){
            if (countLeadZero(m[i]) < i){
              return false
            }
          }
          return true
        }
        m = reorder(m)
        while (!isech()){
          for (var ind = 0; ind < m[0].length-2; ind ++){
            for (var row = 1+ind; row < m.length; row++){
              if (m[row][ind]){
                m[row] = elimrow(ind,m[ind],m[row]);
                if (typeof m[row] == 'string'){
                  return m[row];
                }
                m = reorder(m);
              }
            }
          }
        }

        for (var ind = m[0].length-2; ind > 0; ind--){
          for (var row = 0; row < ind; row++){
            if (!iszero(m[row][ind])){
              m[row] = elimrow(ind,m[ind],m[row]);
              if (typeof m[row] == 'string'){
                return m[row];
              }
              m = reorder(m);
            }
          }
        }

        for (var row = 0; row < m.length; row++){
          var p = 1.0/m[row][row]
          if (p != 1){
            m[row] = multrow(m[row],p)
          }
        }
        return m.map(x=>x[x.length-1]);
      }
      return solve(m.slice());
    }
    /**
     * k-means clustering
     * @memberof math
     * @param {(Object|number[])[]} P an array of point coordinates
     * @param {number} k number of clusters
     * @param {number} [maxIter=100] maximum number of iterations
     * @returns {Object} `result` where: 
     *   `result.center` stores the coordinate of cluster centers; 
     *   `result.labels` stores an array of integers (`0`-`k`) corresponding to cluster index of each point in input array;
     *   `result.summary` stores a summary of this run.
     */
     this.kmeans = function(P,k,maxIter){
       
      if (maxIter == undefined){maxIter = 100;}
        var indices = P.map((x,i)=>i);
        those.random.shuffle(indices);
        var clusters = []
        for (var i = 0; i < k; i++){
          clusters.push({center:P[indices[i]],data:[]})
        }
        var cnt = 0;
        var last = clusters.map(x=>-1);
        var converged;
        function iter(){
          for (var i = 0; i < k; i++){
            clusters[i].data = [];
          }
          for (var i = 0; i < indices.length; i++){
            var idx = indices[i]
            var p = P[idx];
            var mind = Infinity;
            var minj = undefined;
            for (var j = 0; j < k; j++){
              var c = clusters[j].center;
              var d = those.vector.distance(c,p);
              if (d < mind){
                mind = d;
                minj = j;
              }
            }
            clusters[minj].data.push(idx);
          }
          converged = true;
          for (var i = 0; i < k; i++){
            clusters[i].center = those.geometry.midpoint(clusters[i].data.map(x=>P[x]));
            if (those.vector.distance(last[i],clusters[i].center)>Number.EPSILON){
              converged = false;
            }
          }
          if (cnt >= maxIter || converged){
            return false;
          }
          last = clusters.map(x=>x.center);
          cnt ++;
          return true;
        }
        while(iter()){};
        var labels = [];
        for (var i = 0; i < clusters.length; i++){
          for (var j = 0; j < clusters[i].data.length; j++){
            labels[clusters[i].data[j]] = i;
          }
        }
        return {centers:clusters.map(x=>x.center), labels:labels, summary:{converged:converged,iterations:cnt}}
     }
  }
  /** 
   * Utilities for maths on the cartesian plane
   */
  this.geometry = new function(){var that = this;
    /**
     * Find the midpoint of (2 or more) points (averaging)
     * @memberof geometry
     * @param {...(Object|number[])} arguments coordinates of the points
     * @returns {Object|number[]} the midpoint
     */
    this.midpoint = function(){
      var plist = (arguments.length == 1) ? 
        arguments[0] : Array.apply(null, arguments)
      var acc = those.vector.add.apply(null, plist)
      return those.vector.scale(acc,1/plist.length);
    }
    /**
     * Find the bounding box of an array of (2D or 3D) points in `[min,max]` format
     * @memberof geometry
     * @param {...(Object|number[])} P coordinates of the points
     * @returns {(Object|number[])[]} `[upperLeftCorner, lowerRightCorner]` 
     */
    this.bound = function(P){
      var xmin = Infinity
      var xmax = -Infinity
      var ymin = Infinity
      var ymax = -Infinity
      var zmin = Infinity
      var zmax = -Infinity
      for (var i = 0; i < P.length; i++){
        if (P[i].x < xmin){xmin = P[i].x}
        if (P[i].x > xmax){xmax = P[i].x}
        if (P[i].y < ymin){ymin = P[i].y}
        if (P[i].y > ymax){ymax = P[i].y}
        if (P[i].z < zmin){zmin = P[i].z}
        if (P[i].z > zmax){zmax = P[i].z}
      }
      return [those.vector.vector(xmin,ymin,zmin,P[0]),
              those.vector.vector(xmax,ymax,zmax,P[0])]
    }
    /**
     * Find the bounding rectangle of 2D points in `{x,y,width,height}` format
     * @memberof geometry
     * @param {...(Object|number[])} P coordinates of the points
     * @returns {Object} an object containing `x`, `y`, `width`, `height` fields
     */                          
    this.rectangleBound = function(P){
      var bd = that.bound(P);
      return {
        x:bd[0].x,
        y:bd[0].y,
        width: bd[1].x-bd[0].x,
        height:bd[1].y-bd[0].y,
      }
    }

    /**
     * Find standard equation (`ax+by+c=0`) of the (2D) line passing through 2 points 
     * @memberof geometry
     * @param {Object|number[]} pt0 first point
     * @param {Object|number[]} pt1 second point
     * @returns {number[]} `[a, b, c]` where `ax+by+c=0`
     */
    this.lineEquation = function(pt0,pt1){
       var [g,k] = that.slopeIntercept(pt0,pt1);
       if (g != Infinity && g != -Infinity){
        return [g,-1,k]
       }else{
        return [-1,0,pt0.x]
       }
    }
    /**
     * Find the distance from a point to a line
     * @memberof geometry
     * @param {Object|number[]} p the point
     * @param {(Object|number[])[]} a two element array containing two points on the line
     * @returns {number} the distance from the point to the line
     */
    this.distanceToLine = function(p,ln){
      var [a,b,c] = that.lineEquation(...ln)
      return Math.abs(a*p.x+b*p.y+c)/Math.sqrt(a*a+b*b)
    }

    /**
     * Find the slope-intercept form (`y=kx+b`) of the line passing through 2 points
     * @memberof geometry
     * @param {Object|number[]} pt0 first point
     * @param {Object|number[]} pt1 second point
     * @returns {number[]} `[slope, intercept]`
     */
    this.slopeIntercept = function(pt0,pt1){
      var dx = pt1.x-pt0.x
      var dy = pt1.y-pt0.y
      var m = ((dx==Infinity && dy==Infinity) || (dx==0 && dy==0) )?1:dy/dx
      var k = pt0.y - m * pt0.x
      return [m,k]
    }

    /**
     * Project a point onto a (convex) quad
     * @memberof geometry
     * @param {Object|number[]} p the point
     * @param {(Object|number[])[]} quad four vertices of the (convex) quad, in either clockwise or anti-clockwise order
     * @returns {(Object|number[])?} a vector `(x,y)` where `0<=x<=1` and `0<=y<=1` if point is inside quad, `undefined` otherwise.
     */
    this.projectToQuad = function(p,quad){
      var [A,B,C,D] = quad;
      function projectBetweenLines (p,l0,l1){
        var le0 = that.slopeIntercept(...l0)
        var le1 = that.slopeIntercept(...l1)

        var dg = (le0[0]-le1[0])
        var epsilon = 0.00001
        if (Math.abs(dg) < epsilon || (Math.abs(le0[0])==Infinity && Math.abs(le1[0])==Infinity)){
          var d0 = that.distanceToLine(p,l0)
          var d1 = that.distanceToLine(p,l1)
          var d2 = that.distanceToLine(l0[0],l1)
          if (Math.abs(d0 + d1 - d2) > epsilon){
            return -1
          }
          return d0/(d0+d1)
        }
        var I;
        if (Math.abs(le0[0]) == Infinity){
          I = [l0[0].x, l0[0].x*le1[0]+le1[1] ]
        }else if (Math.abs(le1[0]) == Infinity){
          I = [l1[0].x, l1[0].x*le0[0]+le0[1] ]
        }else{
          var x = (le1[1]-le0[1])/dg
          I = [x,le0[0]*x+le0[1]]
        }
        var v0 = those.vector.subtract(l0[0],I)
        var v1 = those.vector.subtract(l1[0],I)
        var v =  those.vector.subtract(p,I);
        var a0 = those.vector.angle(v0,v)
        var a1 = those.vector.angle(v0,v1)
        var a2 = those.vector.angle(v,v1)
        if (Math.abs(a0) > Math.abs(a1) || a0/a1 < 0 || Math.abs(a0+a2-a1) > epsilon){
          return -1
        }
        return a0/a1
      }
      var x = projectBetweenLines(p,[A,D],[B,C])
      var y = projectBetweenLines(p,[A,B],[D,C])
      if (x == -1 || y == -1){
        return undefined
      }
      return those.vector.vector(x,y,0,p)
    }

    /**
     * Find the intersection of two 2D segments/lines/rays (use intersect3d for 3D lines)
     * @memberof geometry
     * @param {(Object|number[])[]} ln0 first line specified by an array containing 2 points
     * @param {(Object|number[])[]} ln1 second line specified by an array containing 2 points
     * @param {string[]} [mode=["segment","segment"]] a 2-element array containing the type of the two lines, each of which can be `"segment"` or `"ray"` or `"line"`
     * @returns {boolean|Object|number[]} point of intersection, or `true` if there are infinitely many, or `false` if there isn't one.
     */
                                 
    this.intersect = function(ln0,ln1,mode){
      if (mode == undefined){mode = ["segment","segment"]};
      
      function useQuick(){
        var le0 = that.slopeIntercept(...ln0)
        var le1 = that.slopeIntercept(...ln1)
        var den = (le0[0]-le1[0])
        if (den == 0){return false}
        var x = (le1[1]-le0[1])/den;
        var y = le0[0]*x+le0[1];
        if (isFinite(x) && isFinite(y) && (!isNaN(x)) && (!isNaN(y))){
          return [x,y]
        }
        return false;
      }
      function useRobust(){
        var le0 = that.lineEquation(...ln0);
        var le1 = that.lineEquation(...ln1);
        return those.math.solveLinearSystem([
          [le0[0], le0[1], -le0[2]],
          [le1[0], le1[1], -le1[2]],
        ]);
      }
      var sol = useQuick() || useRobust();
      if (sol == "overdetermined"){
        return false;
      }
      function makebox(ln,mo){
        if (mo == "segment"){
          return that.bound(ln);
        }else if (mo == "ray"){
          return that.bound([ln[0], Okb.vector.scale(Okb.vector.subtract(ln[1],ln[0]),Infinity)]);
        }else if (mo == "line"){
          return [[-Infinity,-Infinity],[Infinity,Infinity]];
        }
      }
      function inbox(p,box){
        return box[0].x <= p.x&&p.x <= box[1].x
            && box[0].y <= p.y&&p.y <= box[1].y
      }
      var box0 = makebox(ln0,mode[0]);
      var box1 = makebox(ln1,mode[1]);
      if (sol == "underdetermined"){
        return that.rectangleOverlap(
          that.rectangleBound(box0),
          that.rectangleBound(box1),
        )
      }else{
        if (inbox(sol,box0) && inbox(sol,box1)){
          return sol
        }
        return false
      }
    }
    
    /**
     * Find the intersection (or the closest point when they're skew) of two 3D lines
     * @memberof geometry
     * @param {(Object|number[])[]} ln0 first line specified by an array containing 2 points
     * @param {(Object|number[])[]} ln1 second line specified by an array containing 2 points
     * @returns {Object} `{point, parallel, error, parameters}` where 
     * `point` is the intersection point (approximated if lines are skew),
     * `parallel` is a `bool` indicating whether the two lines are parallel (including coincident),
     * `error` is the minimum distance between the two lines (`0` if the lines intersect),
     * `parameters` is a 2-element `Array` containing the interpolation parameter for each of the lines
     *  between end points (which can be used determine segment/ray intersection).
     */                  
    this.intersect3d = function(ln0,ln1){
      var x = {
        point:those.vector.vector(0,0,0),
        parallel:false,
        error:0,
        parameters:[0,0],
      }
      function det(r1, r2, r3){
        var a = r1.x; var b = r1.y; var c = r1.z;
        var d = r2.x; var e = r2.y; var f = r2.z;
        var g = r3.x; var h = r3.y; var i = r3.z;
        return a*e*i + b*f*g + c*d*h - c*e*g - b*d*i - a*f*h;
      }
      var r1 = {o:ln0[0],d:those.vector.subtract(ln0[1],ln0[0])};
      var r2 = {o:ln1[0],d:those.vector.subtract(ln1[1],ln1[0])};
      var vc = those.vector.cross(r1.d,r2.d);
      var vcn = those.vector.norm2(vc);
      if (vcn == 0){
        x.parallel = true;
        return x;
      }
      var t = det(r2.o-r1.o, r2.d, vc)/vcn;
      var s = det(r2.o-r1.o, r1.d, vc)/vcn;
      var x1 = (r1.o + r1.d * t);
      var x2 = (r2.o + r2.d * s);
      x.point = ( x1 + x2 )/2;
      x.error = Math.sqrt(those.vector.norm2(x1-x2));
      x.parameter[0] = t;
      x.parameter[1] = s;
      return x;
    }
                                 
    /**
     * Check if a point is inside a polygon (even-odd algorithm)
     * @memberof geometry
     * @param {Object|number[]} p a point
     * @param {(Object|number[])[]} plist an array containing vertices of the polygon
     * @returns {boolean} `true` if point is inside polygon, `false` if not.
     */
    this.pointInPolygon = function(p,plist){
      var scount = 0;
      for (var i = 0; i < plist.length; i++){
        var np = plist[i!=plist.length-1?i+1:0]
        var sect = that.intersect([plist[i],np],
          [p,[p.x+1,p.y+Math.PI]],["segment","ray"])
        if (sect != false){scount++;}
      }
      return scount % 2 == 1;
    }
    /**
     * Get the length of each side of a polygon
     * @memberof geometry
     * @param {(Object|number[])[]} plist an array containing vertices of the polygon
     * @returns {number[]} array containing length of each side
     */
    this.polygonSides = function(plist){
      var slist = []
      for (var i = 0; i < plist.length; i++){
        var p = plist[i]
        var np = plist[i!=plist.length-1?i+1:0]
        var s = Math.sqrt(Math.pow(np.x-p.x,2)+Math.pow(np.y-p.y,2))
        slist.push(s)
      }
      return slist
    }
    /**
     * Get area of a triangle
     * @memberof geometry
     * @param {(Object|number[])[]} plist an array containing 3 vertices of the triangle
     * @returns {number} the area of the triangle
     */
    this.triangleArea = function(plist){
      var slist = that.polygonSides(plist)
      var a = slist[0], b = slist[1], c = slist[2]
      var s = (a+b+c)/2
      return Math.sqrt(s*(s-a)*(s-b)*(s-c))
    }                          
    /**
     * Divide polygon into multiple triangles (by ear-cutting)
     * @memberof geometry
     * @param {(Object|number[])[]} plist an array containing vertices of the polygon
     * @param {Object} args
     * @param {number} [args.area=100] the maximum area for the triangles, 
     * once all subdivisions are triangles, the algorithm checks this 
     * value and continue splitting until area of all triangles are below
     * this number; put `Infinity` to disable this additional subdivision.
     * @param {boolean} [args.convex=false] put `true` if the polygon is known to be convex. (faster)
     * @param {boolean} [args.optimize=true] if this option is `ture`, a greedy algorithm is used
     * to keep the usually undesirable, "sliver" triangles to a minimum. (slower)
     * @returns {((Object|number[])[])[]} array containing triangles, each triangle is an array of 3 points
     */
    this.triangulate = function(plist,args){
      var args = (args != undefined) ?  args : {};
      var area = (args.area != undefined) ?  args.area : 100;
      var convex = (args.convex != undefined) ?  args.convex : false;
      var optimize = (args.optimize != undefined) ?  args.optimize : true;

      function lnInPoly(ln,plist){
        var lnc = [[0,0],[0,0]]
        var ep = 0.01

        lnc[0][0] = ln[0].x*(1-ep)+ln[1].x*ep
        lnc[0][1] = ln[0].y*(1-ep)+ln[1].y*ep
        lnc[1][0] = ln[0].x*ep+ln[1].x*(1-ep)
        lnc[1][1] = ln[0].y*ep+ln[1].y*(1-ep)

        for (var i = 0; i < plist.length; i++){
          var pt = plist[i]
          var np = plist[i!=plist.length-1?i+1:0]
          if (that.intersect(lnc,[pt,np]) != false){return false}
        }
        var mid = that.midpoint(ln)
        if (that.pointInPolygon(mid,plist) == false){return false}
        return true
      }

      function sliverRatio(plist){
        var A = that.triangleArea(plist)
        var P = that.polygonSides(plist).reduce(function(m,n){return m+n},0)
        return A/P
      }
      function bestEar(plist){
        var cuts = []
        for (var i = 0; i < plist.length; i++){
          var p = plist[i]
          var lp = plist[i!=0?i-1:plist.length-1]
          var np = plist[i!=plist.length-1?i+1:0]
          var qlist = plist.slice()
          qlist.splice(i,1)
          if (convex || lnInPoly([lp,np],plist)){
            var c = [[lp,p,np],qlist];
            if (!optimize) return c
            cuts.push(c)
          }
        }
        var best= [plist,[]];
        var bestRatio = 0
        for (var i = 0; i < cuts.length; i++){
          var r = sliverRatio(cuts[i][0])
          if (r >= bestRatio){
            best = cuts[i]
            bestRatio = r
          }
        }
        return best
      }
      function shatter(plist,a){
        if (plist.length == 0){
          return []
        }
        if (that.triangleArea(plist) < a){
          return [plist]
        }else{
          var slist = that.polygonSides(plist);

          var ind = slist.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
          var nind = (ind + 1) % plist.length
          var lind = (ind + 2) % plist.length

          try{
            var mid = that.midpoint([plist[ind],plist[nind]])
          }catch(err){
            console.log("triangulation err:",plist,err)
            return []
          }
          return shatter([plist[ind],mid,plist[lind]],a).concat(
                 shatter([plist[lind],plist[nind],mid],a))
        }
      }
      if (plist.length <= 3){
        return shatter(plist,area)
      } else{
        var cut = bestEar(plist)
        return shatter(cut[0],area).concat( that.triangulate(cut[1],args))
      }
    }
    /**
     * Check if there's any overlap between two rectangles (edge-inclusive)
     * @memberof geometry
     * @param {Object} a the first rectangle
     * @param {number} a.x x-coordinate
     * @param {number} a.y y-coordinate
     * @param {number} a.width width
     * @param {number} a.height height
     * @param {Object} b the second rectangle
     * @param {number} b.x x-coordinate
     * @param {number} b.y y-coordinate
     * @param {number} b.width width
     * @param {number} b.height height
     * @returns {boolean} `true` if the rectangles overlap, `false` if not.
     */
    this.rectangleOverlap = function(a,b){
      return (
        a.x <= b.x + b.width &&
        a.x + a.width >= b.x &&
        a.y <= b.y + b.height &&
        a.y + a.height >= b.y
      )
    }
    /**
     * Check if there's any overlap between two polygons
     * @memberof geometry
     * @param {(Object|number[])[]} plist0 an array containing vertices of the first polygon
     * @param {(Object|number[])[]} plist1 an array containing vertices of the second polygon
     * @returns {boolean} `true` if the polygons overlap, `false` if not.
     */                            
    this.polygonOverlap = function(plist0, plist1){
      for (var i = 0; i < plist0.length; i++){
        var l0 = [plist0[i],plist0[(i+1)%plist0.length]]
        for (var j = 0; j < plist1.length; j++){
          var l1 = [plist1[j],plist1[(j+1)%plist1.length]]
          if (that.intersect(l0,l1)){
            return true;
          }
        }
      }
      if (that.pointInPolygon(plist0[0],plist1)){
        return true;
      }
      if (that.pointInPolygon(plist1[0],plist0)){
        return true;
      }
      return false;
    }
                                 
    /**
     * Generate variable-width "tube" shape from a polyline, similar to outlining a stroke.
     * @memberof geometry
     * @param {(Object|number[])[]} plist array of points representing the polyline
     * @param {function} [widthFunction=(x)=>(10)] a function with domain 0 to 1, 
     * specifying the width of the tube at `(index of a point / number of points), 
     * e.g. pass `(x)=>(c)` for a tube with constant width of `c`. 
     * @returns {((Object|number[])[])[]} `[left, right]` two polylines reprenting the outline of the tube,
     * use `left.concat(right.slice().reverse())` to join them into single polygon.
     */
    this.tube = function(plist, widthFunction){
      var pts = plist;
      var widthFunction = (widthFunction != undefined) ? widthFunction : (x)=>(10);
      var vtxlist0 = []
      var vtxlist1 = []
      var vtxlist = []
      for (var i = 1; i < pts.length-1; i++){
        var w = widthFunction(i/pts.length)
        var a1 = Math.atan2(pts[i].y-pts[i-1].y,pts[i].x-pts[i-1].x);
        var a2 = Math.atan2(pts[i].y-pts[i+1].y,pts[i].x-pts[i+1].x);
        var a = (a1+a2)/2;
        if (a < a2){a+=Math.PI}
        var wcosa = w*Math.cos(a)
        var wsina = w*Math.sin(a)
        vtxlist0.push(those.vector.vector(pts[i].x+wcosa,pts[i].y+wsina,pts[i].z,pts[i]));
        vtxlist1.push(those.vector.vector(pts[i].x-wcosa,pts[i].y-wsina,pts[i].z,pts[i]));
      }
      var l = pts.length-1
      var a0 = Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x) - Math.PI/2;
      var a1 = Math.atan2(pts[l].y-pts[l-1].y,pts[l].x-pts[l-1].x) - Math.PI/2;
      var w0 = widthFunction(0)
      var w1 = widthFunction(1)
      var w0cosa0 = w0*Math.cos(a0)
      var w0sina0 = w0*Math.sin(a0)
      var w1cosa1 = w1*Math.cos(a1)
      var w1sina1 = w1*Math.sin(a1)
      vtxlist0.unshift(those.vector.vector(pts[0].x+w0cosa0,pts[0].y+w0sina0,pts[0].z,pts[0]))
      vtxlist1.unshift(those.vector.vector(pts[0].x-w0cosa0,pts[0].y-w0sina0,pts[0].z,pts[0]))
      vtxlist0.push(those.vector.vector(pts[l].x+w1cosa1,pts[l].y+w1sina1,pts[l].z,pts[l]))
      vtxlist1.push(those.vector.vector(pts[l].x-w1cosa1,pts[l].y-w1sina1,pts[l].z,pts[l]))
      return [vtxlist0,vtxlist1]
    }
    /**
     * Divide each segment of a polyline to multiple shorter segments
     * @memberof geometry
     * @param {(Object|number[])[]} plist array of points representing the polyline
     * @param {number} n number of subdivisions for each segment
     * @returns {(Object|number[])[]} a new array of points
     */
    this.subdivide = function(plist,n){
      var tl = (plist.length-1)*n;
      var rlist = []
      for (var i = 0; i < tl; i+=1){
        var lastp = plist[Math.floor(i/n)]
        var nextp = plist[Math.ceil(i/n)]
        var r = (i % n)/n;
        var np = those.vector.lerp(lastp,nextp,r);
        rlist.push(np);
      }
      if (plist.length > 0){
        rlist.push(plist[plist.length-1])
      }
      return rlist
    }
    /**
     * Re-divide a polyline into segments of (almost) equal length, given desired total number of segments.
     * @example
     * // re-divide a polyline that has 2 segments, into one with 5 segments.
     * var polyline = redivide( [ [0,0], [10,0], [10,10] ], 5 )
     * console.log(polyline) // [ [0,0], [4,0], [8,0], [10,2], [10,6], [10,10] ]
     * @memberof geometry
     * @param {(Object|number[])[]} plist array of points representing the polyline
     * @param {number} n total number of segments
     * @returns {(Object|number[])[]} a new array of points
     */
    this.redivide = function(plist,n){
      if (plist.length <= 1){
        return plist
      }
      var tl = those.vector.distance.apply(null,plist)
      var sl = tl/n;
      var idx = 0;
      var acc = those.vector.distance(plist[0],plist[1]);
      var rlist = []
      var cl = 0
      var float_epsilon = 0.01
      var cnt = 0;
      for (var i = 0; i < n+1; i++){
        while (cl > acc+float_epsilon && idx < plist.length - 2){
          cl = cl-Math.max(acc,float_epsilon)
          idx += 1
          acc = those.vector.distance(plist[idx],plist[idx+1]);
          cnt += 1;
        }
        var r = cl/acc
        var np = those.vector.lerp(plist[idx],plist[idx+1],r);
        rlist.push(np);
        cl += sl
      }
      return rlist
    }
    
    /**
     * Get the convex hull of an array of points
     * @memberof geometry
     * @param {(Object|number[])[]} plist array of points
     * @returns {(Object|number[])[]} the convex hull
     */
    this.convexHull = function(plist){
      // Three points are a counter-clockwise turn if ccw > 0, clockwise if
      // ccw < 0, and collinear if ccw = 0 because ccw is a determinant that
      // gives twice the signed  area of the triangle formed by p1, p2 and p3.
      function ccw(p1, p2, p3){
        return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x)
      }
      function lowestY(plist){
        var mi = 0;
        var mv = 1/0;
        for (var i = 0; i < plist.length; i++){
          if (plist[i].y < mv){
            mv = plist[i].y;
            mi = i;
          }
        }
        return mi;
      }
      
      var N = plist.length;
      var points = plist.slice();
      var p = points.splice(lowestY(plist),1)[0];
      var keyfunc = (q)=>(Math.atan2(q.y-p.y, q.x-p.x));
      points.sort((a,b)=>(keyfunc(a)-keyfunc(b)));      
      points.unshift(p);

      var stack = []
      stack.push(points[0]);
      stack.push(points[1]);

      for (var i = 2; i < points.length; i++){
        while (stack.length >= 2 && ccw(stack[stack.length-2], stack[stack.length-1], points[i]) <= 0){
          stack.pop();
        }
        stack.push(points[i])
      }
      return stack;
    }
  }
  /** 
   * Utilities for drawing procedurally generated visuals. 
   * Supports multiple backends such as HTML Canvas, SVG (Scalable Vector Graphics), and p5.js.
   * @property {string} [BACKEND="canvas"] `"canvas"`|`"svg"`|`"p5"`
   * @property {Object} CONTEXT the context specific to the backend.
   * For HTML Canvas, this would be `canvas.getContext('2d')`; For p5.js, this would be 
   * the `window` object if in global mode, or the `sketch` object in instance mode;
   * For svg, this property is not used;
   */
  this.graphics = new function(){var that = this;
    this.BACKEND = "canvas"
    this.CONTEXT = undefined;
    /**
     * Set the backend for subsequent drawing (See `BACKEND`)
     * @memberof graphics
     * @param {string} be `"canvas"`|`"svg"`|`"p5"`
     */
    this.backend = function(be){
      that.BACKEND = be;
    }
    /**
     * Set context for subsequent drawing (See `CONTEXT`)
     * @memberof graphics
     * @param {Object} ctx `CanvasRenderingContext2D`|`window`|`sketch`|`undefined` depending on backend
     */
    this.context = function(ctx){
      that.CONTEXT = ctx;
    }
    /**
     * Draw a polygon
     * @memberof graphics
     * @param {Object} args arguments
     * @param {string} [args.backend=BACKEND] override current backend (See `backend()` and `BACKEND`)
     * @param {Object} [args.context=CONTEXT] override current context (See `context()` and `CONTEXT`)
     * @param {number[]|string} [args.fill=[255,255,255]] fill color, pass `undefined` for outline-only.
     * Color can be a 1 - 4 element array or the color name as string. See also `color.css()`
     * @param {number[]|string} [args.stroke=[255,255,255]] stroke (outline) color, pass `undefined` for fill-only
     * @param {number} [args.strokeWidth=1] stroke (outline) width (weight)
     * @param {Object|number[]} [args.offset={x:0,y:0}] offset every vertex by a vector
     * @param {boolean} args.close whether or not to close the shape (draw first vertex twice)
     * @returns {string?} if `BACKEND` is `"svg"`, returns the svg notation in a string.
     */
    this.polygon = function(args){
      var args =(args != undefined) ? args : {};
      var context = (args.context != undefined) ? args.context : that.CONTEXT;
      var backend = (args.backend != undefined) ? args.backend : that.BACKEND;

      var fill = ("fill" in args) ? args.fill : [255,255,255];
      var stroke = ("stroke" in args) ? args.stroke : [0,0,0];
      var strokeWidth = (args.strokeWidth != undefined) ? args.strokeWidth : 1;
      var offset = (args.offset != undefined) ? args.offset : {x:0,y:0};
      var close = (args.close != undefined) ? args.close : true;
      return function(points){
        if (backend == "canvas"){
          context.beginPath();
          if (points.length > 0){
            context.moveTo(points[0].x+offset.x,points[0].y+offset.y);
          }
          for (var i = 1; i < points.length; i++){
            context.lineTo(points[i].x+offset.x,points[i].y+offset.y);
          }
          if (fill != undefined){
            context.fillStyle = those.color.css(fill);
            context.fill();
          }
          if (stroke != undefined){
            if (close){
              context.lineTo(points[0].x+offset.x,points[0].y+offset.y);
            }
            context.strokeStyle = those.color.css(stroke);
            context.lineWidth = strokeWidth;
            context.stroke();
          }
        }else if (backend == "svg"){
          var result = `<path d ="M`
          for (var i = 0; i < points.length+(!!close); i++){
            if (i == 1){
              result += "L"
            }
            result += (points[i%points.length].x+offset.x) + " " 
                    + (points[i%points.length].y+offset.y) + " "
          }
          result += `" stroke="`+those.color.css(stroke)
                  + (strokeWidth > 0 ? (`" stroke-width="`+strokeWidth) : "")
                  + `" fill="`+those.color.css(fill)
          result += `"/>`
          return result
        }else if (backend == "p5"){
          if (fill != undefined){
            context.fill.apply(null,fill);
          }else{
            context.noFill();
          }
          if (stroke != undefined){
            context.stroke.apply(null,stroke);
            context.strokeWeight(strokeWidth);
          }else{
            context.noStroke();
          }
          context.beginShape();
          for (var i = 0; i < points.length+(!!close); i++){
            var oz = offset.z
            var ii = i % points.length
            if (points[ii].z != undefined){
              oz = oz || 0
              context.vertex(points[ii].x+offset.x,points[ii].y+offset.y,points[ii].z+oz);
            }
            context.vertex(points[ii].x+offset.x,points[ii].y+offset.y);
          }
          context.endShape();
        }
      }
    }
    /**
     * Draw a polyline as an organic, parametric brushstroke
     * @memberof graphics
     * @param {Object} args arguments
     * @param {string} [args.backend=BACKEND] override current backend (See `backend()` and `BACKEND`)
     * @param {Object} [args.context=CONTEXT] override current context (See `context()` and `CONTEXT`)
     * @param {number[]|string} [args.color=[0,0,0]] color brushstroke color
     * Color can be a 1 - 4 element array or the color name as string. See also `color.css()`
     * @param {function} args.widthFunction a function with domain 0 to 1, 
     * specifying the width of the brushstroke from start to end, 
     * e.g. pass `(x)=>(c)` for a brushstroke with constant width of `c`. 
     * default is a sinusoidal with perlin noise.
     * @param {Object|number[]} [args.offset={x:0,y:0}] offset every vertex by a vector
     * @param {number} args.resample pass `0` if the polyline vertices should be used as-is, or pass a larger number
     * to re-subdivide the polyline to that number of segments. The default value is adaptive to total length of polyline,
     * making the length of each segment to be about `10`.
     * @returns {string?} if `BACKEND` is `"svg"`, returns the svg notation in a string.
     */
    this.brushstroke = function(args){
      var args = (args != undefined) ? args : {};
      var color = (args.color != undefined) ? args.color : [0,0,0];
      var _noise_offset = Math.random() * Math.PI;
      var widthFunction = (args.widthFunction != undefined) ? args.widthFunction : 
        (x)=>(10*Math.sin(x*Math.PI)*those.math.map(those.random.perlin(x*10,_noise_offset),0,1,0.7,1))

      return function(points){
        var resample = (args.resample != undefined) ? args.resample : Math.ceil(those.vector.distance.apply(null,points) / 10);
        var args1 = Object.assign({},args,{fill:color, stroke:args.stroke})
        var pts = points;
        if (resample > 0){
          pts = those.geometry.redivide(pts,resample);
        }
        var [vtxlist0,vtxlist1] = those.geometry.tube(pts,widthFunction);
        return that.polygon(args1)(vtxlist0.concat(vtxlist1.slice().reverse()));
      }
    }
    /**
     * Draw a texture with distortion/perspective/affine transformation specified by a quad (useful for 2.5D)
     * @memberof graphics
     * @param {Object} args arguments
     * @param {string} [args.backend=BACKEND] override current backend (See `backend()` and `BACKEND`)
     * @param {Object} [args.context=CONTEXT] override current context (See `context()` and `CONTEXT`)
     * @param {((number[])[])[]} args.texture the texture, colors (`[r,(g,b,a)]`) stored in a 2D matrix
     * @param {(Object|number[])[]} args.vertices four vertices of the convex quad, in either clockwise or anti-clockwise order
     * @param {number} [args.pixelSize=1] size of a pixel - increase to get pixelated but faster graphics
     * @returns {string?} if `BACKEND` is `"svg"`, returns the svg notation in a string.
     */
    this.projectTexture = function(args){
      var args =(args != undefined) ? args : {};
      var context = (args.context != undefined) ? args.context : that.CONTEXT;
      var backend = (args.backend != undefined) ? args.backend : that.BACKEND;
      var tex = (args.texture != undefined) ? args.texture : [[[0]]];
      var vertices = (args.vertices != undefined) ? args.vertices : [[0,0],[64,0],[64,64],[0,64]];
      var pixelSize = (args.pixelSize != undefined) ? args.pixelSize : 1;

      var [m, M] = those.geometry.bound(vertices)

      var result = "";
      for (var x = m.x; x < M.x; x+=pixelSize){
        for (var y = m.y; y < M.y; y+=pixelSize){
          var p = those.geometry.projectToQuad([x,y],vertices);
          if (p==undefined || !(0 <= p.x && p.x <= 1) || !(0 <= p.y && p.y <= 1) ){
            continue
          }
          var c;
          try{
            c = tex[Math.floor(p.y*tex.length)][Math.floor(p.x*tex[0].length)]
          }catch(e){
            continue;
          }
          if (c == undefined){
            continue;
          }
          if (backend == "canvas"){
            context.fillStyle = those.color.css(c);
            context.fillRect(x,y,pixelSize,pixelSize);
          }else if (backend == "p5"){
            context.fill.apply(null,c);
            context.noStroke();
            context.rect(x,y,pixelSize,pixelSize);
          }else if (backend == "svg"){
            result += `<path d="M`+x+` `+y+` h`+pixelSize+` v`+pixelSize+` h -`+pixelSize
                   +` Z" fill="`+those.color.css(c)+`" stroke="none"/>`
          }
        }
      }
      if (backend == "svg"){
        return result;
      }
    }
  }
  /** 
   * Utilities for calculating colors and converting them between different formats.
   */
  this.color = new function(){var that = this;
    /**
     * HSV (Hue Saturation Value) to RGB color space converter.
     * @memberof color
     * @param {number} h hue, `0<=h<=360`
     * @param {number} s saturation, `0<=s<=1`
     * @param {number} v value (brightness), `0<=v<=1`
     * @returns {number[]} `[r, g, b]` in `[0, 255] x [0, 255] x [0, 255]`
     */
    this.hsv = function(h,s,v){
      var c = v*s
      var x = c*(1-Math.abs((h/60)%2-1))
      var m = v-c
      var [rv,gv,bv] = ([[c,x,0],[x,c,0],[0,c,x],
                         [0,x,c],[x,0,c],[c,0,x]])[Math.floor(h/60)]
      return [(rv+m)*255,(gv+m)*255,(bv+m)*255]
    }
    /**
     * Generate CSS color string from a variety of inputs
     * @example
     * console.log(css(42));           // "rgb(42,42,42)"
     * console.log(css(42,0.5));       // "rgba(42,42,42,0.5)"
     * console.log(css(42,24,3));      // "rgb(42,24,3)"
     * console.log(css(42,24,3,0.5));  // "rgba(42,24,3,0.5)"
     * console.log(css([42,0.5]));     // "rgba(42,42,42,0.5)"
     * console.log(css([42,24,3]));    // "rgb(42,24,3)"
     * console.log(css([42,24,3,0.5]));// "rgba(42,24,3,0.5)"
     * console.log(css("cyan"));       // "cyan"
     * @memberof color
     * @param {...number|number[]|string} arguments numbers, array or string representing the color (see example)
     * @returns {string} css color string
     */
    this.css = function(){
      var round = Math.floor
      if (arguments.length == 1){
        if (arguments[0] == undefined){
          return "none"
        } else if (typeof(arguments[0]) == 'number'){
          return "rgb("+round(arguments[0])+","+round(arguments[0])+","+round(arguments[0])+")"
        }else if (typeof(arguments[0]) == "string"){
          return arguments[0]
        }else{
          return that.css.apply(null, arguments[0])
        }
      } else if (arguments.length == 2){
        return "rgba("+round(arguments[0])+","+round(arguments[0])+","+round(arguments[0])+","+arguments[1]+")"
      } else if (arguments.length == 3){
        return "rgb("+round(arguments[0])+","+round(arguments[1])+","+round(arguments[2])+")"
      }else if (arguments.length == 4){
        return "rgba("+round(arguments[0])+","+round(arguments[1])+","+round(arguments[2])+","+arguments[3]+")"
      }

    }
    /**
     * Lerp hue, wrapping around 360 degs
     * @example
     * console.log(lerpHue(20,40,0.8))  // 36
     * console.log(lerpHue(350,20,0.5)) // 5
     * console.log(lerpHue(30,350,0.8)) // 358
     * @memberof color
     * @param {number} h0 first hue
     * @param {number} h1 second hue
     * @param {number} t second hue
     * @returns {number} new hue
     */
    this.lerpHue = function(h0,h1,t){
      var methods = [
        [Math.abs(h1-h0),     those.math.map(t,0,1,h0,h1)],
        [Math.abs(h1+360-h0), those.math.map(t,0,1,h0,h1+360)],
        [Math.abs(h1-360-h0), those.math.map(t,0,1,h0,h1-360)]
       ]
      methods.sort((x,y)=>(x[0]-y[0]))
      return (methods[0][1]+720)%360
    }
  }
  /** 
   * Collection of procedural textures.
   */
  this.texture = new function(){var that = this;
    /**
     * Generate wood texture. Optionally tile-able.
     * @example
     * // initialize a 512x512 texture
     * var tex = wood({width:512, height:512})
     * for (var y = 0; y < 512; y++){
     *     for (var x = 0; x < 512; x++){
     *         var [r, g, b] = tex[y][x];
     *         // do something with the pixel
     * @memberof texture
     * @param {Object} args arguments
     * @param {number} [args.width=512] width of the texture
     * @param {number} [args.height=512] height of the texture
     * @param {number} [args.scale=1] scale of the patterns in texture
     * @param {number} [args.grain=1] amount of grain effect
     * @param {boolean} [args.tile=false] set to `true` to enable seamless tiling of this texture
     * @param {number[]} [args.colorA=[100,50,10]] first (dark) color
     * @param {number[]} [args.colorB=[210,162,104]] second (light) color
     * @returns {((number[])[])[]} 3D matrix where `matrix[i][j]=[r,g,b]`, the color of the pixel at `x=j`, `y=i`
     */
    this.wood = function(args){
      var args = (args != undefined) ? args : {};
      var width = (args.width != undefined) ? args.width : 512;
      var height = (args.height != undefined) ? args.height : 512;
      var scale = (args.scale != undefined) ? args.scale : 1;
      var grain = (args.grain != undefined) ? args.grain : 1;
      var tile = (args.tile != undefined)   ? args.tile : false;
      var colorA = (args.colorA != undefined) ? args.colorA : [100, 50, 10];
      var colorB = (args.colorB != undefined) ? args.colorB : [210,162,104];
      var arr = []
      for (var i = 0; i < height; i++){
        arr.push([])
        for (var j = 0; j < width; j++){
          arr[i].push([0,0,0])
        }
      }
      var sc = 1/(scale*width/512)
      var vshift = height/5*scale
      for (var i = 0; i < height+vshift; i++){
        for (var j = 0; j < width; j++){
          var s0 = 0.001 *sc
          var s1 = 0.004 *sc
          var s2 = 0.1 * sc
          var s3 = 0.5 * sc

          if (!tile){
            var nz = Math.floor(those.random.perlin(i*s0,j*s1)*1000*Math.pow(sc,-0.8));
            var nsz = Math.floor(those.random.perlin(i*s2,j*s3)*90*grain);
          }else{
            var nz = Math.floor(those.random.tileNoise(height*s0,width*s1)(i*s0,j*s1)*1000*Math.pow(sc,-0.8));
            var nsz = Math.floor(those.random.tileNoise(height*s2,width*s3)(i*s2,j*s3)*90*grain);
          }
          var col1 = [colorA[0]-nsz,colorA[1]-nsz,colorA[2]-nsz];
          var col2 = [colorB[0]-nsz,colorB[1]-nsz,colorB[2]-nsz];
          var col;
          if (nz%40 < 30){
            col = those.vector.lerp(col1,col2,nz%40/30);
          }else{
            col = those.vector.lerp(col1,col2,(nz%40-30)/10);
          }
          var ii = Math.round(i+those.random.perlin(j*0.05*sc)*vshift-vshift)
          if (0 <= ii && ii < height){
            arr[ii][j] = col;
          }
        }
      }
      return arr
    }
    /**
     * Generate rice paper texture
     * @example
     * // initialize a 512x512 texture
     * var tex = ricePaper({width:512, height:512})
     * for (var y = 0; y < 512; y++){
     *     for (var x = 0; x < 512; x++){
     *         var [r, g, b] = tex[y][x];
     *         // do something with the pixel
     * @memberof texture
     * @param {Object} args arguments
     * @param {number} [args.width=512] width of the texture
     * @param {number} [args.height=512] height of the texture
     * @param {number} [args.grain=20] amount of grain effect
     * @param {number} [args.sprinkle=1] amount of sprinkle effect
     * @param {number[]} [args.color=[250,232,189]] color of paper
     * @returns {((number[])[])[]} 3D matrix where `matrix[i][j]=[r,g,b]`, the color of the pixel at `x=j`, `y=i`
     */
    this.ricePaper = function(args){
      var args =(args != undefined) ? args : {};
      var width = (args.width != undefined) ? args.width : 512;
      var height = (args.height != undefined) ? args.height : 512;
      var col = (args.color != undefined) ? args.color : [250,232,189];
      var tex = (args.grain != undefined) ? args.grain : 20;
      var spr = (args.sprinkle != undefined) ? args.sprinkle : 1;
      var arr = []
      for (var i = 0; i < height; i++){
        arr.push([])
        for (var j = 0; j < width; j++){
          arr[i].push([0,0,0])
        }
      }
      for (var i = 0; i < height; i++){
        for (var j = 0; j < width; j++){
          var c = (255-those.random.perlin(i*0.1,j*0.1)*tex*0.5)
          c -= Math.random()*tex;
          var r = (c*col[0]/255)
          var g = (c*col[1]/255)
          var b = (c*col[2]/255)
          if (those.random.perlin(i*0.04,j*0.04,2)*Math.random()*spr>0.7 
           || Math.random()<0.005*spr){
            r = (c*0.7)
            g = (c*0.5)
            b = (c*0.2)
          }
          arr[i][j] = [r,g,b]
        }
      }
      return arr
    }

    var sphereNoise = function(width,height){
      return function(x,y,z){
        if (z == undefined){z = 0};
        var r = (width/2)/Math.PI
        var ph = (x/width) * (Math.PI*2);
        var th = (y/height) * (Math.PI*2);
        var nx = r * Math.sin(ph) * Math.cos(th);
        var ny = r * Math.sin(ph) * Math.sin(th);
        var nz = r * Math.cos(ph);
        var pad = r;
        return those.random.perlin(pad+nx,pad+ny,pad+nz+z)
      }
    }
    /**
     * Generate tile-able knit-like patterns
     * @example
     * // initialize a 128x128 texture
     * var tex = texture.knitPattern({width:128, height:128})
     * for (var y = 0; y < 512; y++){
     *     for (var x = 0; x < 512; x++){
     *         var [r, g, b] = tex[y%128][x%128];
     *         // do something with the pixel
     * @memberof texture
     * @param {Object} args arguments
     * @param {number} [args.width=128] width of the repeatable region
     * @param {number} [args.height=128] height of the repeatable region
     * @param {number} [args.scale=10] scale of the patterns in texture
     * @param {number} [args.hue=Math.random()*360] hue/tint (0-360) of the texture
     * @param {number} [args.mono=false] put `true` to generate monotone texture instead of colored
     * @returns {((number[])[])[]} 3D matrix where `matrix[i][j]=[r,g,b]`, the color of the pixel at `x=j`, `y=i`
     */
    this.knitPattern = function(args){
      var args = (args != undefined) ? args : {};
      var width = (args.width != undefined) ? args.width : 128;
      var height = (args.height != undefined) ? args.height : 128;
      var mono = (args.mono != undefined) ? args.mono : false;
      var hue = (args.hue != undefined) ? args.hue : Math.random()*360
      var scale = (args.scale != undefined) ? args.scale : 10
      var arr = []
      for (var i = 0; i < height; i++){
        arr.push([])
        for (var j = 0; j < width; j++){
          arr[i].push(mono ? 0 : [0,0,0])
        }
      }
      var tn = sphereNoise(scale,scale)
      for (var i = 0; i < height; i++){
        for (var j = 0; j < width; j++){
          var ii = scale * i / height;
          var jj = scale * j / width;
          
          if (!mono){
            var g0 = tn(jj,ii)
            var g1 = tn(jj,ii,Math.E)
            var g2 = tn(jj,ii,Math.PI)
            arr[i][j] = those.color.hsv(Math.floor((g0*360+hue)%360),g1,g2)
          }else{
            var g0 = Math.floor(tn(jj,ii))
            arr[i][j] = [g0,g0,g0]
          }
        }
      }
      return arr
    }
  }
  /**
   * Inject functions in this library into global scope (browser only). If an identifier is already used in global, it will be skipped.
   * @param {number} [level=1] at `level=1` all sub-namespaces such as `graphics` and `geometry` are put into global scope, 
   * at `level=2` all functions are put into global scope
   */
  this.explode = function(level){
    if (level == undefined){ level = 1};

    if (typeof window != "object"){
      console.log("`explode()` only works in browser mode!")
      return;
    }
    var expd = []
    if (level == 1){
      var keys = Object.keys(those)
      for (var i = 0; i < keys.length; i++){
        if (keys[i] in window){
          console.log("identifier clash: ",keys[i],", skipping...")
          continue
        }
        window[keys[i]] = those[keys[i]]
        expd.push(keys[i])
      }
    }else if (level >= 2){
      var keys = Object.keys(those)
      for (var i = 0; i < keys.length; i++){
        var ikeys = Object.keys(those[keys[i]])
        for (var j = 0; j < ikeys.length; j++){
          if (ikeys[j] in window){
            console.log("identifier clash: ",ikeys[j],", skipping...")
            continue
          }
          window[ikeys[j]] = those[keys[i]][ikeys[j]]
          expd.push(ikeys[j])
        }
      }
    }
    console.log("exploded into global scope: ",expd)
    return expd
  }

}

if (typeof module === "object"){
  module.exports = Okb;
}


