// uniform float time;
// uniform float progress;
// uniform sampler2D texture1;
// uniform sampler2D texture2;
// uniform vec4 resolution;
// varying vec2 vUv;
// varying vec4 vPosition;
// void main()	{
//    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
//    vec2 p = newUV;
//    float x = progress;
//    x = smoothstep(.0,1.0,(x*2.0+p.x-1.0));
//    vec4 f = mix(
//       texture2D(texture1, (p-.5)*(1.-x)+.5), 
//       texture2D(texture2, (p-.5)*x+.5), 
//       x);
//    gl_FragColor = f;
// }


// uniform float time;
// uniform float progress;
// uniform float width;
// uniform float scaleX;
// uniform float scaleY;
// uniform float transition;
// uniform float radius;
// uniform float swipe;
// uniform sampler2D texture1;
// uniform sampler2D texture2;
// uniform sampler2D displacement;
// uniform vec4 resolution;
// varying vec2 vUv;
// varying vec4 vPosition;
// float parabola( float x, float k ) {
//    return pow( 4. * x * ( 1. - x ), k );
// }
// void main()	{
//    vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
//    vec2 p = newUV;
//    vec2 start = vec2(0.5,0.5);
//    vec2 aspect = resolution.wz;
//    vec2 uv = newUV;
//    //float dt = parabola(progress, 1.);
//    //vec4 noise = texture2D(displacement, fract(vUv+time*0.04));
//    float prog = progress*0.66 ;
//    float circ = 1. - smoothstep(-width, 0.0, radius * distance((start*aspect), (uv*aspect / 2.)) - prog*(1.+width));
//    float intpl = pow(abs(circ), 1.);
//    vec4 t1 = texture2D( texture1, (uv - 0.5) * (1.0 - intpl) + 0.5 ) ;
//    vec4 t2 = texture2D( texture2, (uv - 0.5) * intpl + 0.5 );
//    gl_FragColor = mix( t1, t2, intpl );
// }


uniform float time;
		uniform float progress;
		uniform float intensity;
		uniform float width;
		uniform float scaleX;
		uniform float scaleY;
		uniform float transition;
		uniform float radius;
		uniform float swipe;
		uniform sampler2D texture1;
		uniform sampler2D texture2;
		uniform sampler2D displacement;
		uniform vec4 resolution;
		varying vec2 vUv;
		mat2 getRotM(float angle) {
		    float s = sin(angle);
		    float c = cos(angle);
		    return mat2(c, -s, s, c);
		}
		const float PI = 3.1415;
		const float angle1 = PI *0.25;
		const float angle2 = -PI *0.75;
		void main()	{
			vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
			vec4 disp = texture2D(displacement, newUV);
			vec2 dispVec = vec2(disp.r, disp.g);
			vec2 distortedPosition1 = newUV + getRotM(angle1) * dispVec * intensity * progress;
			vec4 t1 = texture2D(texture1, distortedPosition1);
			vec2 distortedPosition2 = newUV + getRotM(angle2) * dispVec * intensity * (1.0 - progress);
			vec4 t2 = texture2D(texture2, distortedPosition2);
			gl_FragColor = mix(t1, t2, progress);
		}