(()=>{var vo=Object.create;var mt=Object.defineProperty;var yo=Object.getOwnPropertyDescriptor;var wo=Object.getOwnPropertyNames;var _o=Object.getPrototypeOf,ko=Object.prototype.hasOwnProperty;var xo=(S,c,d)=>c in S?mt(S,c,{enumerable:!0,configurable:!0,writable:!0,value:d}):S[c]=d;var $o=(S,c)=>()=>(c||S((c={exports:{}}).exports,c),c.exports);var Mo=(S,c,d,m)=>{if(c&&typeof c=="object"||typeof c=="function")for(let v of wo(c))!ko.call(S,v)&&v!==d&&mt(S,v,{get:()=>c[v],enumerable:!(m=yo(c,v))||m.enumerable});return S};var Fo=(S,c,d)=>(d=S!=null?vo(_o(S)):{},Mo(c||!S||!S.__esModule?mt(d,"default",{value:S,enumerable:!0}):d,S));var Be=(S,c,d)=>(xo(S,typeof c!="symbol"?c+"":c,d),d);var tn=$o((vt,yt)=>{(function(S,c){typeof vt=="object"&&typeof yt<"u"?yt.exports=c():typeof define=="function"&&define.amd?define(c):(S=typeof globalThis<"u"?globalThis:S||self).chroma=c()})(vt,function(){"use strict";for(var S=function(e,t,a){return t===void 0&&(t=0),a===void 0&&(a=1),e<t?t:e>a?a:e},c=S,d={},m=0,v=["Boolean","Number","String","Function","Array","Date","RegExp","Undefined","Null"];m<v.length;m+=1){var C=v[m];d["[object "+C+"]"]=C.toLowerCase()}var $=function(e){return d[Object.prototype.toString.call(e)]||"object"},L=$,T=$,D=Math.PI,p={clip_rgb:function(e){e._clipped=!1,e._unclipped=e.slice(0);for(var t=0;t<=3;t++)t<3?((e[t]<0||e[t]>255)&&(e._clipped=!0),e[t]=c(e[t],0,255)):t===3&&(e[t]=c(e[t],0,1));return e},limit:S,type:$,unpack:function(e,t){return t===void 0&&(t=null),e.length>=3?Array.prototype.slice.call(e):L(e[0])=="object"&&t?t.split("").filter(function(a){return e[0][a]!==void 0}).map(function(a){return e[0][a]}):e[0]},last:function(e){if(e.length<2)return null;var t=e.length-1;return T(e[t])=="string"?e[t].toLowerCase():null},PI:D,TWOPI:2*D,PITHIRD:D/3,DEG2RAD:D/180,RAD2DEG:180/D},H={format:{},autodetect:[]},an=p.last,nn=p.clip_rgb,xt=p.type,re=H,$t=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=this;if(xt(e[0])==="object"&&e[0].constructor&&e[0].constructor===this.constructor)return e[0];var n=an(e),i=!1;if(!n){i=!0,re.sorted||(re.autodetect=re.autodetect.sort(function(u,f){return f.p-u.p}),re.sorted=!0);for(var o=0,r=re.autodetect;o<r.length;o+=1){var s=r[o];if(n=s.test.apply(s,e))break}}if(!re.format[n])throw new Error("unknown format: "+e);var l=re.format[n].apply(null,i?e:e.slice(0,-1));a._rgb=nn(l),a._rgb.length===3&&a._rgb.push(1)};$t.prototype.toString=function(){return xt(this.hex)=="function"?this.hex():"["+this._rgb.join(",")+"]"};var M=$t,Fe=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Fe.Color,[null].concat(e)))};Fe.Color=M,Fe.version="2.4.2";var G=Fe,rn=p.unpack,Mt=Math.max,on=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=rn(e,"rgb"),n=a[0],i=a[1],o=a[2],r=1-Mt(n/=255,Mt(i/=255,o/=255)),s=r<1?1/(1-r):0,l=(1-n-r)*s,u=(1-i-r)*s,f=(1-o-r)*s;return[l,u,f,r]},sn=p.unpack,ln=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=(e=sn(e,"cmyk"))[0],n=e[1],i=e[2],o=e[3],r=e.length>4?e[4]:1;return o===1?[0,0,0,r]:[a>=1?0:255*(1-a)*(1-o),n>=1?0:255*(1-n)*(1-o),i>=1?0:255*(1-i)*(1-o),r]},cn=G,Ft=M,Ct=H,un=p.unpack,fn=p.type,hn=on;Ft.prototype.cmyk=function(){return hn(this._rgb)},cn.cmyk=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Ft,[null].concat(e,["cmyk"])))},Ct.format.cmyk=ln,Ct.autodetect.push({p:2,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=un(e,"cmyk"),fn(e)==="array"&&e.length===4)return"cmyk"}});var dn=p.unpack,pn=p.last,Le=function(e){return Math.round(100*e)/100},gn=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=dn(e,"hsla"),n=pn(e)||"lsa";return a[0]=Le(a[0]||0),a[1]=Le(100*a[1])+"%",a[2]=Le(100*a[2])+"%",n==="hsla"||a.length>3&&a[3]<1?(a[3]=a.length>3?a[3]:1,n="hsla"):a.length=3,n+"("+a.join(",")+")"},mn=p.unpack,Nt=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=(e=mn(e,"rgba"))[0],n=e[1],i=e[2];a/=255,n/=255,i/=255;var o,r,s=Math.min(a,n,i),l=Math.max(a,n,i),u=(l+s)/2;return l===s?(o=0,r=Number.NaN):o=u<.5?(l-s)/(l+s):(l-s)/(2-l-s),a==l?r=(n-i)/(l-s):n==l?r=2+(i-a)/(l-s):i==l&&(r=4+(a-n)/(l-s)),(r*=60)<0&&(r+=360),e.length>3&&e[3]!==void 0?[r,o,u,e[3]]:[r,o,u]},bn=p.unpack,vn=p.last,yn=gn,wn=Nt,Te=Math.round,_n=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=bn(e,"rgba"),n=vn(e)||"rgb";return n.substr(0,3)=="hsl"?yn(wn(a),n):(a[0]=Te(a[0]),a[1]=Te(a[1]),a[2]=Te(a[2]),(n==="rgba"||a.length>3&&a[3]<1)&&(a[3]=a.length>3?a[3]:1,n="rgba"),n+"("+a.slice(0,n==="rgb"?3:4).join(",")+")")},kn=p.unpack,je=Math.round,At=function(){for(var e,t=[],a=arguments.length;a--;)t[a]=arguments[a];var n,i,o,r=(t=kn(t,"hsl"))[0],s=t[1],l=t[2];if(s===0)n=i=o=255*l;else{var u=[0,0,0],f=[0,0,0],b=l<.5?l*(1+s):l+s-l*s,w=2*l-b,y=r/360;u[0]=y+1/3,u[1]=y,u[2]=y-1/3;for(var g=0;g<3;g++)u[g]<0&&(u[g]+=1),u[g]>1&&(u[g]-=1),6*u[g]<1?f[g]=w+6*(b-w)*u[g]:2*u[g]<1?f[g]=b:3*u[g]<2?f[g]=w+(b-w)*(2/3-u[g])*6:f[g]=w;n=(e=[je(255*f[0]),je(255*f[1]),je(255*f[2])])[0],i=e[1],o=e[2]}return t.length>3?[n,i,o,t[3]]:[n,i,o,1]},Et=At,St=H,Dt=/^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/,Pt=/^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/,Ot=/^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,Rt=/^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,Bt=/^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,It=/^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,Lt=Math.round,Tt=function(e){var t;if(e=e.toLowerCase().trim(),St.format.named)try{return St.format.named(e)}catch{}if(t=e.match(Dt)){for(var a=t.slice(1,4),n=0;n<3;n++)a[n]=+a[n];return a[3]=1,a}if(t=e.match(Pt)){for(var i=t.slice(1,5),o=0;o<4;o++)i[o]=+i[o];return i}if(t=e.match(Ot)){for(var r=t.slice(1,4),s=0;s<3;s++)r[s]=Lt(2.55*r[s]);return r[3]=1,r}if(t=e.match(Rt)){for(var l=t.slice(1,5),u=0;u<3;u++)l[u]=Lt(2.55*l[u]);return l[3]=+l[3],l}if(t=e.match(Bt)){var f=t.slice(1,4);f[1]*=.01,f[2]*=.01;var b=Et(f);return b[3]=1,b}if(t=e.match(It)){var w=t.slice(1,4);w[1]*=.01,w[2]*=.01;var y=Et(w);return y[3]=+t[4],y}};Tt.test=function(e){return Dt.test(e)||Pt.test(e)||Ot.test(e)||Rt.test(e)||Bt.test(e)||It.test(e)};var xn=G,jt=M,qt=H,$n=p.type,Mn=_n,Gt=Tt;jt.prototype.css=function(e){return Mn(this._rgb,e)},xn.css=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(jt,[null].concat(e,["css"])))},qt.format.css=Gt,qt.autodetect.push({p:5,test:function(e){for(var t=[],a=arguments.length-1;a-- >0;)t[a]=arguments[a+1];if(!t.length&&$n(e)==="string"&&Gt.test(e))return"css"}});var Wt=M,Fn=G,Cn=p.unpack;H.format.gl=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=Cn(e,"rgba");return a[0]*=255,a[1]*=255,a[2]*=255,a},Fn.gl=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Wt,[null].concat(e,["gl"])))},Wt.prototype.gl=function(){var e=this._rgb;return[e[0]/255,e[1]/255,e[2]/255,e[3]]};var Nn=p.unpack,An=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a,n=Nn(e,"rgb"),i=n[0],o=n[1],r=n[2],s=Math.min(i,o,r),l=Math.max(i,o,r),u=l-s,f=100*u/255,b=s/(255-u)*100;return u===0?a=Number.NaN:(i===l&&(a=(o-r)/u),o===l&&(a=2+(r-i)/u),r===l&&(a=4+(i-o)/u),(a*=60)<0&&(a+=360)),[a,f,b]},En=p.unpack,Sn=Math.floor,Dn=function(){for(var e,t,a,n,i,o,r=[],s=arguments.length;s--;)r[s]=arguments[s];var l,u,f,b=(r=En(r,"hcg"))[0],w=r[1],y=r[2];y*=255;var g=255*w;if(w===0)l=u=f=y;else{b===360&&(b=0),b>360&&(b-=360),b<0&&(b+=360);var k=Sn(b/=60),_=b-k,O=y*(1-w),E=O+g*(1-_),q=O+g*_,V=O+g;switch(k){case 0:l=(e=[V,q,O])[0],u=e[1],f=e[2];break;case 1:l=(t=[E,V,O])[0],u=t[1],f=t[2];break;case 2:l=(a=[O,V,q])[0],u=a[1],f=a[2];break;case 3:l=(n=[O,E,V])[0],u=n[1],f=n[2];break;case 4:l=(i=[q,O,V])[0],u=i[1],f=i[2];break;case 5:l=(o=[V,O,E])[0],u=o[1],f=o[2]}}return[l,u,f,r.length>3?r[3]:1]},Pn=p.unpack,On=p.type,Rn=G,Vt=M,Ht=H,Bn=An;Vt.prototype.hcg=function(){return Bn(this._rgb)},Rn.hcg=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Vt,[null].concat(e,["hcg"])))},Ht.format.hcg=Dn,Ht.autodetect.push({p:1,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=Pn(e,"hcg"),On(e)==="array"&&e.length===3)return"hcg"}});var In=p.unpack,Ln=p.last,Ce=Math.round,zt=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=In(e,"rgba"),n=a[0],i=a[1],o=a[2],r=a[3],s=Ln(e)||"auto";r===void 0&&(r=1),s==="auto"&&(s=r<1?"rgba":"rgb");var l=(n=Ce(n))<<16|(i=Ce(i))<<8|(o=Ce(o)),u="000000"+l.toString(16);u=u.substr(u.length-6);var f="0"+Ce(255*r).toString(16);switch(f=f.substr(f.length-2),s.toLowerCase()){case"rgba":return"#"+u+f;case"argb":return"#"+f+u;default:return"#"+u}},Tn=/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,jn=/^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/,Ut=function(e){if(e.match(Tn)){e.length!==4&&e.length!==7||(e=e.substr(1)),e.length===3&&(e=(e=e.split(""))[0]+e[0]+e[1]+e[1]+e[2]+e[2]);var t=parseInt(e,16);return[t>>16,t>>8&255,255&t,1]}if(e.match(jn)){e.length!==5&&e.length!==9||(e=e.substr(1)),e.length===4&&(e=(e=e.split(""))[0]+e[0]+e[1]+e[1]+e[2]+e[2]+e[3]+e[3]);var a=parseInt(e,16);return[a>>24&255,a>>16&255,a>>8&255,Math.round((255&a)/255*100)/100]}throw new Error("unknown hex color: "+e)},qn=G,Yt=M,Gn=p.type,Qt=H,Wn=zt;Yt.prototype.hex=function(e){return Wn(this._rgb,e)},qn.hex=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Yt,[null].concat(e,["hex"])))},Qt.format.hex=Ut,Qt.autodetect.push({p:4,test:function(e){for(var t=[],a=arguments.length-1;a-- >0;)t[a]=arguments[a+1];if(!t.length&&Gn(e)==="string"&&[3,4,5,6,7,8,9].indexOf(e.length)>=0)return"hex"}});var Vn=p.unpack,Jt=p.TWOPI,Hn=Math.min,zn=Math.sqrt,Un=Math.acos,Yn=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a,n=Vn(e,"rgb"),i=n[0],o=n[1],r=n[2],s=Hn(i/=255,o/=255,r/=255),l=(i+o+r)/3,u=l>0?1-s/l:0;return u===0?a=NaN:(a=(i-o+(i-r))/2,a/=zn((i-o)*(i-o)+(i-r)*(o-r)),a=Un(a),r>o&&(a=Jt-a),a/=Jt),[360*a,u,l]},Qn=p.unpack,qe=p.limit,ue=p.TWOPI,Ge=p.PITHIRD,fe=Math.cos,Jn=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a,n,i,o=(e=Qn(e,"hsi"))[0],r=e[1],s=e[2];return isNaN(o)&&(o=0),isNaN(r)&&(r=0),o>360&&(o-=360),o<0&&(o+=360),(o/=360)<1/3?n=1-((i=(1-r)/3)+(a=(1+r*fe(ue*o)/fe(Ge-ue*o))/3)):o<2/3?i=1-((a=(1-r)/3)+(n=(1+r*fe(ue*(o-=1/3))/fe(Ge-ue*o))/3)):a=1-((n=(1-r)/3)+(i=(1+r*fe(ue*(o-=2/3))/fe(Ge-ue*o))/3)),[255*(a=qe(s*a*3)),255*(n=qe(s*n*3)),255*(i=qe(s*i*3)),e.length>3?e[3]:1]},Kn=p.unpack,Zn=p.type,Xn=G,Kt=M,Zt=H,er=Yn;Kt.prototype.hsi=function(){return er(this._rgb)},Xn.hsi=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Kt,[null].concat(e,["hsi"])))},Zt.format.hsi=Jn,Zt.autodetect.push({p:2,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=Kn(e,"hsi"),Zn(e)==="array"&&e.length===3)return"hsi"}});var tr=p.unpack,ar=p.type,nr=G,Xt=M,ea=H,rr=Nt;Xt.prototype.hsl=function(){return rr(this._rgb)},nr.hsl=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Xt,[null].concat(e,["hsl"])))},ea.format.hsl=At,ea.autodetect.push({p:2,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=tr(e,"hsl"),ar(e)==="array"&&e.length===3)return"hsl"}});var ir=p.unpack,or=Math.min,sr=Math.max,lr=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a,n,i,o=(e=ir(e,"rgb"))[0],r=e[1],s=e[2],l=or(o,r,s),u=sr(o,r,s),f=u-l;return i=u/255,u===0?(a=Number.NaN,n=0):(n=f/u,o===u&&(a=(r-s)/f),r===u&&(a=2+(s-o)/f),s===u&&(a=4+(o-r)/f),(a*=60)<0&&(a+=360)),[a,n,i]},cr=p.unpack,ur=Math.floor,fr=function(){for(var e,t,a,n,i,o,r=[],s=arguments.length;s--;)r[s]=arguments[s];var l,u,f,b=(r=cr(r,"hsv"))[0],w=r[1],y=r[2];if(y*=255,w===0)l=u=f=y;else{b===360&&(b=0),b>360&&(b-=360),b<0&&(b+=360);var g=ur(b/=60),k=b-g,_=y*(1-w),O=y*(1-w*k),E=y*(1-w*(1-k));switch(g){case 0:l=(e=[y,E,_])[0],u=e[1],f=e[2];break;case 1:l=(t=[O,y,_])[0],u=t[1],f=t[2];break;case 2:l=(a=[_,y,E])[0],u=a[1],f=a[2];break;case 3:l=(n=[_,O,y])[0],u=n[1],f=n[2];break;case 4:l=(i=[E,_,y])[0],u=i[1],f=i[2];break;case 5:l=(o=[y,_,O])[0],u=o[1],f=o[2]}}return[l,u,f,r.length>3?r[3]:1]},hr=p.unpack,dr=p.type,pr=G,ta=M,aa=H,gr=lr;ta.prototype.hsv=function(){return gr(this._rgb)},pr.hsv=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(ta,[null].concat(e,["hsv"])))},aa.format.hsv=fr,aa.autodetect.push({p:2,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=hr(e,"hsv"),dr(e)==="array"&&e.length===3)return"hsv"}});var Ne={Kn:18,Xn:.95047,Yn:1,Zn:1.08883,t0:.137931034,t1:.206896552,t2:.12841855,t3:.008856452},he=Ne,mr=p.unpack,na=Math.pow,We=function(e){return(e/=255)<=.04045?e/12.92:na((e+.055)/1.055,2.4)},Ve=function(e){return e>he.t3?na(e,1/3):e/he.t2+he.t0},br=function(e,t,a){return e=We(e),t=We(t),a=We(a),[Ve((.4124564*e+.3575761*t+.1804375*a)/he.Xn),Ve((.2126729*e+.7151522*t+.072175*a)/he.Yn),Ve((.0193339*e+.119192*t+.9503041*a)/he.Zn)]},ra=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=mr(e,"rgb"),n=a[0],i=a[1],o=a[2],r=br(n,i,o),s=r[0],l=r[1],u=r[2],f=116*l-16;return[f<0?0:f,500*(s-l),200*(l-u)]},de=Ne,vr=p.unpack,yr=Math.pow,He=function(e){return 255*(e<=.00304?12.92*e:1.055*yr(e,1/2.4)-.055)},ze=function(e){return e>de.t1?e*e*e:de.t2*(e-de.t0)},ia=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a,n,i,o=(e=vr(e,"lab"))[0],r=e[1],s=e[2];return n=(o+16)/116,a=isNaN(r)?n:n+r/500,i=isNaN(s)?n:n-s/200,n=de.Yn*ze(n),a=de.Xn*ze(a),i=de.Zn*ze(i),[He(3.2404542*a-1.5371385*n-.4985314*i),He(-.969266*a+1.8760108*n+.041556*i),He(.0556434*a-.2040259*n+1.0572252*i),e.length>3?e[3]:1]},wr=p.unpack,_r=p.type,kr=G,oa=M,sa=H,xr=ra;oa.prototype.lab=function(){return xr(this._rgb)},kr.lab=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(oa,[null].concat(e,["lab"])))},sa.format.lab=ia,sa.autodetect.push({p:2,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=wr(e,"lab"),_r(e)==="array"&&e.length===3)return"lab"}});var $r=p.unpack,Mr=p.RAD2DEG,Fr=Math.sqrt,Cr=Math.atan2,Nr=Math.round,la=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=$r(e,"lab"),n=a[0],i=a[1],o=a[2],r=Fr(i*i+o*o),s=(Cr(o,i)*Mr+360)%360;return Nr(1e4*r)===0&&(s=Number.NaN),[n,r,s]},Ar=p.unpack,Er=ra,Sr=la,Dr=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=Ar(e,"rgb"),n=a[0],i=a[1],o=a[2],r=Er(n,i,o),s=r[0],l=r[1],u=r[2];return Sr(s,l,u)},Pr=p.unpack,Or=p.DEG2RAD,Rr=Math.sin,Br=Math.cos,ca=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=Pr(e,"lch"),n=a[0],i=a[1],o=a[2];return isNaN(o)&&(o=0),[n,Br(o*=Or)*i,Rr(o)*i]},Ir=p.unpack,Lr=ca,Tr=ia,ua=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=(e=Ir(e,"lch"))[0],n=e[1],i=e[2],o=Lr(a,n,i),r=o[0],s=o[1],l=o[2],u=Tr(r,s,l),f=u[0],b=u[1],w=u[2];return[f,b,w,e.length>3?e[3]:1]},jr=p.unpack,qr=ua,Gr=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=jr(e,"hcl").reverse();return qr.apply(void 0,a)},Wr=p.unpack,Vr=p.type,fa=G,Ae=M,Ue=H,ha=Dr;Ae.prototype.lch=function(){return ha(this._rgb)},Ae.prototype.hcl=function(){return ha(this._rgb).reverse()},fa.lch=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Ae,[null].concat(e,["lch"])))},fa.hcl=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Ae,[null].concat(e,["hcl"])))},Ue.format.lch=ua,Ue.format.hcl=Gr,["lch","hcl"].forEach(function(e){return Ue.autodetect.push({p:2,test:function(){for(var t=[],a=arguments.length;a--;)t[a]=arguments[a];if(t=Wr(t,e),Vr(t)==="array"&&t.length===3)return e}})});var da={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflower:"#6495ed",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",laserlemon:"#ffff54",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrod:"#fafad2",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",maroon2:"#7f0000",maroon3:"#b03060",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",purple2:"#7f007f",purple3:"#a020f0",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"},pa=H,Hr=p.type,we=da,zr=Ut,Ur=zt;M.prototype.name=function(){for(var e=Ur(this._rgb,"rgb"),t=0,a=Object.keys(we);t<a.length;t+=1){var n=a[t];if(we[n]===e)return n.toLowerCase()}return e},pa.format.named=function(e){if(e=e.toLowerCase(),we[e])return zr(we[e]);throw new Error("unknown color name: "+e)},pa.autodetect.push({p:5,test:function(e){for(var t=[],a=arguments.length-1;a-- >0;)t[a]=arguments[a+1];if(!t.length&&Hr(e)==="string"&&we[e.toLowerCase()])return"named"}});var Yr=p.unpack,Qr=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=Yr(e,"rgb"),n=a[0],i=a[1],o=a[2];return(n<<16)+(i<<8)+o},Jr=p.type,Kr=function(e){if(Jr(e)=="number"&&e>=0&&e<=16777215)return[e>>16,e>>8&255,255&e,1];throw new Error("unknown num color: "+e)},Zr=G,ga=M,ma=H,Xr=p.type,ei=Qr;ga.prototype.num=function(){return ei(this._rgb)},Zr.num=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(ga,[null].concat(e,["num"])))},ma.format.num=Kr,ma.autodetect.push({p:5,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e.length===1&&Xr(e[0])==="number"&&e[0]>=0&&e[0]<=16777215)return"num"}});var ti=G,Ye=M,ba=H,va=p.unpack,ya=p.type,wa=Math.round;Ye.prototype.rgb=function(e){return e===void 0&&(e=!0),e===!1?this._rgb.slice(0,3):this._rgb.slice(0,3).map(wa)},Ye.prototype.rgba=function(e){return e===void 0&&(e=!0),this._rgb.slice(0,4).map(function(t,a){return a<3?e===!1?t:wa(t):t})},ti.rgb=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Ye,[null].concat(e,["rgb"])))},ba.format.rgb=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=va(e,"rgba");return a[3]===void 0&&(a[3]=1),a},ba.autodetect.push({p:3,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=va(e,"rgba"),ya(e)==="array"&&(e.length===3||e.length===4&&ya(e[3])=="number"&&e[3]>=0&&e[3]<=1))return"rgb"}});var Ee=Math.log,_a=function(e){var t,a,n,i=e/100;return i<66?(t=255,a=i<6?0:-155.25485562709179-.44596950469579133*(a=i-2)+104.49216199393888*Ee(a),n=i<20?0:.8274096064007395*(n=i-10)-254.76935184120902+115.67994401066147*Ee(n)):(t=351.97690566805693+.114206453784165*(t=i-55)-40.25366309332127*Ee(t),a=325.4494125711974+.07943456536662342*(a=i-50)-28.0852963507957*Ee(a),n=255),[t,a,n,1]},ai=_a,ni=p.unpack,ri=Math.round,ii=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];for(var a,n=ni(e,"rgb"),i=n[0],o=n[2],r=1e3,s=4e4,l=.4;s-r>l;){var u=ai(a=.5*(s+r));u[2]/u[0]>=o/i?s=a:r=a}return ri(a)},Qe=G,Se=M,Je=H,oi=ii;Se.prototype.temp=Se.prototype.kelvin=Se.prototype.temperature=function(){return oi(this._rgb)},Qe.temp=Qe.kelvin=Qe.temperature=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Se,[null].concat(e,["temp"])))},Je.format.temp=Je.format.kelvin=Je.format.temperature=_a;var si=p.unpack,Ke=Math.cbrt,li=Math.pow,ci=Math.sign,ka=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=si(e,"rgb"),n=a[0],i=a[1],o=a[2],r=[Ze(n/255),Ze(i/255),Ze(o/255)],s=r[0],l=r[1],u=r[2],f=Ke(.4122214708*s+.5363325363*l+.0514459929*u),b=Ke(.2119034982*s+.6806995451*l+.1073969566*u),w=Ke(.0883024619*s+.2817188376*l+.6299787005*u);return[.2104542553*f+.793617785*b-.0040720468*w,1.9779984951*f-2.428592205*b+.4505937099*w,.0259040371*f+.7827717662*b-.808675766*w]};function Ze(e){var t=Math.abs(e);return t<.04045?e/12.92:(ci(e)||1)*li((t+.055)/1.055,2.4)}var ui=p.unpack,De=Math.pow,fi=Math.sign,xa=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=(e=ui(e,"lab"))[0],n=e[1],i=e[2],o=De(a+.3963377774*n+.2158037573*i,3),r=De(a-.1055613458*n-.0638541728*i,3),s=De(a-.0894841775*n-1.291485548*i,3);return[255*Xe(4.0767416621*o-3.3077115913*r+.2309699292*s),255*Xe(-1.2684380046*o+2.6097574011*r-.3413193965*s),255*Xe(-.0041960863*o-.7034186147*r+1.707614701*s),e.length>3?e[3]:1]};function Xe(e){var t=Math.abs(e);return t>.0031308?(fi(e)||1)*(1.055*De(t,1/2.4)-.055):12.92*e}var hi=p.unpack,di=p.type,pi=G,$a=M,Ma=H,gi=ka;$a.prototype.oklab=function(){return gi(this._rgb)},pi.oklab=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply($a,[null].concat(e,["oklab"])))},Ma.format.oklab=xa,Ma.autodetect.push({p:3,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=hi(e,"oklab"),di(e)==="array"&&e.length===3)return"oklab"}});var mi=p.unpack,bi=ka,vi=la,yi=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=mi(e,"rgb"),n=a[0],i=a[1],o=a[2],r=bi(n,i,o),s=r[0],l=r[1],u=r[2];return vi(s,l,u)},wi=p.unpack,_i=ca,ki=xa,xi=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var a=(e=wi(e,"lch"))[0],n=e[1],i=e[2],o=_i(a,n,i),r=o[0],s=o[1],l=o[2],u=ki(r,s,l),f=u[0],b=u[1],w=u[2];return[f,b,w,e.length>3?e[3]:1]},$i=p.unpack,Mi=p.type,Fi=G,Fa=M,Ca=H,Ci=yi;Fa.prototype.oklch=function(){return Ci(this._rgb)},Fi.oklch=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return new(Function.prototype.bind.apply(Fa,[null].concat(e,["oklch"])))},Ca.format.oklch=xi,Ca.autodetect.push({p:3,test:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(e=$i(e,"oklch"),Mi(e)==="array"&&e.length===3)return"oklch"}});var Na=M,Ni=p.type;Na.prototype.alpha=function(e,t){return t===void 0&&(t=!1),e!==void 0&&Ni(e)==="number"?t?(this._rgb[3]=e,this):new Na([this._rgb[0],this._rgb[1],this._rgb[2],e],"rgb"):this._rgb[3]},M.prototype.clipped=function(){return this._rgb._clipped||!1};var ie=M,Ai=Ne;ie.prototype.darken=function(e){e===void 0&&(e=1);var t=this.lab();return t[0]-=Ai.Kn*e,new ie(t,"lab").alpha(this.alpha(),!0)},ie.prototype.brighten=function(e){return e===void 0&&(e=1),this.darken(-e)},ie.prototype.darker=ie.prototype.darken,ie.prototype.brighter=ie.prototype.brighten,M.prototype.get=function(e){var t=e.split("."),a=t[0],n=t[1],i=this[a]();if(n){var o=a.indexOf(n)-(a.substr(0,2)==="ok"?2:0);if(o>-1)return i[o];throw new Error("unknown channel "+n+" in mode "+a)}return i};var pe=M,Ei=p.type,Si=Math.pow;pe.prototype.luminance=function(e){if(e!==void 0&&Ei(e)==="number"){if(e===0)return new pe([0,0,0,this._rgb[3]],"rgb");if(e===1)return new pe([255,255,255,this._rgb[3]],"rgb");var t=this.luminance(),a=20,n=function(o,r){var s=o.interpolate(r,.5,"rgb"),l=s.luminance();return Math.abs(e-l)<1e-7||!a--?s:l>e?n(o,s):n(s,r)},i=(t>e?n(new pe([0,0,0]),this):n(this,new pe([255,255,255]))).rgb();return new pe(i.concat([this._rgb[3]]))}return Di.apply(void 0,this._rgb.slice(0,3))};var Di=function(e,t,a){return .2126*(e=et(e))+.7152*(t=et(t))+.0722*(a=et(a))},et=function(e){return(e/=255)<=.03928?e/12.92:Si((e+.055)/1.055,2.4)},J={},Aa=M,Ea=p.type,Pe=J,Sa=function(e,t,a){a===void 0&&(a=.5);for(var n=[],i=arguments.length-3;i-- >0;)n[i]=arguments[i+3];var o=n[0]||"lrgb";if(Pe[o]||n.length||(o=Object.keys(Pe)[0]),!Pe[o])throw new Error("interpolation mode "+o+" is not defined");return Ea(e)!=="object"&&(e=new Aa(e)),Ea(t)!=="object"&&(t=new Aa(t)),Pe[o](e,t,a).alpha(e.alpha()+a*(t.alpha()-e.alpha()))},Da=M,Pi=Sa;Da.prototype.mix=Da.prototype.interpolate=function(e,t){t===void 0&&(t=.5);for(var a=[],n=arguments.length-2;n-- >0;)a[n]=arguments[n+2];return Pi.apply(void 0,[this,e,t].concat(a))};var Pa=M;Pa.prototype.premultiply=function(e){e===void 0&&(e=!1);var t=this._rgb,a=t[3];return e?(this._rgb=[t[0]*a,t[1]*a,t[2]*a,a],this):new Pa([t[0]*a,t[1]*a,t[2]*a,a],"rgb")};var tt=M,Oi=Ne;tt.prototype.saturate=function(e){e===void 0&&(e=1);var t=this.lch();return t[1]+=Oi.Kn*e,t[1]<0&&(t[1]=0),new tt(t,"lch").alpha(this.alpha(),!0)},tt.prototype.desaturate=function(e){return e===void 0&&(e=1),this.saturate(-e)};var Oa=M,Ra=p.type;Oa.prototype.set=function(e,t,a){a===void 0&&(a=!1);var n=e.split("."),i=n[0],o=n[1],r=this[i]();if(o){var s=i.indexOf(o)-(i.substr(0,2)==="ok"?2:0);if(s>-1){if(Ra(t)=="string")switch(t.charAt(0)){case"+":case"-":r[s]+=+t;break;case"*":r[s]*=+t.substr(1);break;case"/":r[s]/=+t.substr(1);break;default:r[s]=+t}else{if(Ra(t)!=="number")throw new Error("unsupported value for Color.set");r[s]=t}var l=new Oa(r,i);return a?(this._rgb=l._rgb,this):l}throw new Error("unknown channel "+o+" in mode "+i)}return r};var Ri=M;J.rgb=function(e,t,a){var n=e._rgb,i=t._rgb;return new Ri(n[0]+a*(i[0]-n[0]),n[1]+a*(i[1]-n[1]),n[2]+a*(i[2]-n[2]),"rgb")};var Bi=M,at=Math.sqrt,ge=Math.pow;J.lrgb=function(e,t,a){var n=e._rgb,i=n[0],o=n[1],r=n[2],s=t._rgb,l=s[0],u=s[1],f=s[2];return new Bi(at(ge(i,2)*(1-a)+ge(l,2)*a),at(ge(o,2)*(1-a)+ge(u,2)*a),at(ge(r,2)*(1-a)+ge(f,2)*a),"rgb")};var Ii=M;J.lab=function(e,t,a){var n=e.lab(),i=t.lab();return new Ii(n[0]+a*(i[0]-n[0]),n[1]+a*(i[1]-n[1]),n[2]+a*(i[2]-n[2]),"lab")};var Li=M,me=function(e,t,a,n){var i,o,r,s,l,u,f,b,w,y,g,k,_;return n==="hsl"?(r=e.hsl(),s=t.hsl()):n==="hsv"?(r=e.hsv(),s=t.hsv()):n==="hcg"?(r=e.hcg(),s=t.hcg()):n==="hsi"?(r=e.hsi(),s=t.hsi()):n==="lch"||n==="hcl"?(n="hcl",r=e.hcl(),s=t.hcl()):n==="oklch"&&(r=e.oklch().reverse(),s=t.oklch().reverse()),n.substr(0,1)!=="h"&&n!=="oklch"||(l=(i=r)[0],f=i[1],w=i[2],u=(o=s)[0],b=o[1],y=o[2]),isNaN(l)||isNaN(u)?isNaN(l)?isNaN(u)?k=Number.NaN:(k=u,w!=1&&w!=0||n=="hsv"||(g=b)):(k=l,y!=1&&y!=0||n=="hsv"||(g=f)):k=l+a*(u>l&&u-l>180?u-(l+360):u<l&&l-u>180?u+360-l:u-l),g===void 0&&(g=f+a*(b-f)),_=w+a*(y-w),new Li(n==="oklch"?[_,g,k]:[k,g,_],n)},Ti=me,Ba=function(e,t,a){return Ti(e,t,a,"lch")};J.lch=Ba,J.hcl=Ba;var ji=M;J.num=function(e,t,a){var n=e.num(),i=t.num();return new ji(n+a*(i-n),"num")};var qi=me;J.hcg=function(e,t,a){return qi(e,t,a,"hcg")};var Gi=me;J.hsi=function(e,t,a){return Gi(e,t,a,"hsi")};var Wi=me;J.hsl=function(e,t,a){return Wi(e,t,a,"hsl")};var Vi=me;J.hsv=function(e,t,a){return Vi(e,t,a,"hsv")};var Hi=M;J.oklab=function(e,t,a){var n=e.oklab(),i=t.oklab();return new Hi(n[0]+a*(i[0]-n[0]),n[1]+a*(i[1]-n[1]),n[2]+a*(i[2]-n[2]),"oklab")};var zi=me;J.oklch=function(e,t,a){return zi(e,t,a,"oklch")};var nt=M,Ui=p.clip_rgb,rt=Math.pow,it=Math.sqrt,ot=Math.PI,Ia=Math.cos,La=Math.sin,Yi=Math.atan2,Qi=function(e,t){for(var a=e.length,n=[0,0,0,0],i=0;i<e.length;i++){var o=e[i],r=t[i]/a,s=o._rgb;n[0]+=rt(s[0],2)*r,n[1]+=rt(s[1],2)*r,n[2]+=rt(s[2],2)*r,n[3]+=s[3]*r}return n[0]=it(n[0]),n[1]=it(n[1]),n[2]=it(n[2]),n[3]>.9999999&&(n[3]=1),new nt(Ui(n))},K=G,be=p.type,Ji=Math.pow,st=function(e){var t="rgb",a=K("#ccc"),n=0,i=[0,1],o=[],r=[0,0],s=!1,l=[],u=!1,f=0,b=1,w=!1,y={},g=!0,k=1,_=function(h){if((h=h||["#fff","#000"])&&be(h)==="string"&&K.brewer&&K.brewer[h.toLowerCase()]&&(h=K.brewer[h.toLowerCase()]),be(h)==="array"){h.length===1&&(h=[h[0],h[0]]),h=h.slice(0);for(var x=0;x<h.length;x++)h[x]=K(h[x]);o.length=0;for(var A=0;A<h.length;A++)o.push(A/(h.length-1))}return V(),l=h},O=function(h){return h},E=function(h){return h},q=function(h,x){var A,F;if(x==null&&(x=!1),isNaN(h)||h===null)return a;if(x)F=h;else if(s&&s.length>2){var U=function(I){if(s!=null){for(var B=s.length-1,Y=0;Y<B&&I>=s[Y];)Y++;return Y-1}return 0}(h);F=U/(s.length-2)}else F=b!==f?(h-f)/(b-f):1;F=E(F),x||(F=O(F)),k!==1&&(F=Ji(F,k)),F=r[0]+F*(1-r[0]-r[1]),F=Math.min(1,Math.max(0,F));var j=Math.floor(1e4*F);if(g&&y[j])A=y[j];else{if(be(l)==="array")for(var R=0;R<o.length;R++){var P=o[R];if(F<=P){A=l[R];break}if(F>=P&&R===o.length-1){A=l[R];break}if(F>P&&F<o[R+1]){F=(F-P)/(o[R+1]-P),A=K.interpolate(l[R],l[R+1],F,t);break}}else be(l)==="function"&&(A=l(F));g&&(y[j]=A)}return A},V=function(){return y={}};_(e);var N=function(h){var x=K(q(h));return u&&x[u]?x[u]():x};return N.classes=function(h){if(h!=null){if(be(h)==="array")s=h,i=[h[0],h[h.length-1]];else{var x=K.analyze(i);s=h===0?[x.min,x.max]:K.limits(x,"e",h)}return N}return s},N.domain=function(h){if(!arguments.length)return i;f=h[0],b=h[h.length-1],o=[];var x=l.length;if(h.length===x&&f!==b)for(var A=0,F=Array.from(h);A<F.length;A+=1){var U=F[A];o.push((U-f)/(b-f))}else{for(var j=0;j<x;j++)o.push(j/(x-1));if(h.length>2){var R=h.map(function(I,B){return B/(h.length-1)}),P=h.map(function(I){return(I-f)/(b-f)});P.every(function(I,B){return R[B]===I})||(E=function(I){if(I<=0||I>=1)return I;for(var B=0;I>=P[B+1];)B++;var Y=(I-P[B])/(P[B+1]-P[B]);return R[B]+Y*(R[B+1]-R[B])})}}return i=[f,b],N},N.mode=function(h){return arguments.length?(t=h,V(),N):t},N.range=function(h,x){return _(h),N},N.out=function(h){return u=h,N},N.spread=function(h){return arguments.length?(n=h,N):n},N.correctLightness=function(h){return h==null&&(h=!0),w=h,V(),O=w?function(x){for(var A=q(0,!0).lab()[0],F=q(1,!0).lab()[0],U=A>F,j=q(x,!0).lab()[0],R=A+(F-A)*x,P=j-R,I=0,B=1,Y=20;Math.abs(P)>.01&&Y-- >0;)U&&(P*=-1),P<0?(I=x,x+=.5*(B-x)):(B=x,x+=.5*(I-x)),j=q(x,!0).lab()[0],P=j-R;return x}:function(x){return x},N},N.padding=function(h){return h!=null?(be(h)==="number"&&(h=[h,h]),r=h,N):r},N.colors=function(h,x){arguments.length<2&&(x="hex");var A=[];if(arguments.length===0)A=l.slice(0);else if(h===1)A=[N(.5)];else if(h>1){var F=i[0],U=i[1]-F;A=Ki(0,h,!1).map(function(B){return N(F+B/(h-1)*U)})}else{e=[];var j=[];if(s&&s.length>2)for(var R=1,P=s.length,I=1<=P;I?R<P:R>P;I?R++:R--)j.push(.5*(s[R-1]+s[R]));else j=i;A=j.map(function(B){return N(B)})}return K[x]&&(A=A.map(function(B){return B[x]()})),A},N.cache=function(h){return h!=null?(g=h,N):g},N.gamma=function(h){return h!=null?(k=h,N):k},N.nodata=function(h){return h!=null?(a=K(h),N):a},N};function Ki(e,t,a){for(var n=[],i=e<t,o=a?i?t+1:t-1:t,r=e;i?r<o:r>o;i?r++:r--)n.push(r);return n}var _e=M,Zi=st,lt=G,Z=function(e,t,a){if(!Z[a])throw new Error("unknown blend mode "+a);return Z[a](e,t)},ae=function(e){return function(t,a){var n=lt(a).rgb(),i=lt(t).rgb();return lt.rgb(e(n,i))}},ne=function(e){return function(t,a){var n=[];return n[0]=e(t[0],a[0]),n[1]=e(t[1],a[1]),n[2]=e(t[2],a[2]),n}};Z.normal=ae(ne(function(e){return e})),Z.multiply=ae(ne(function(e,t){return e*t/255})),Z.screen=ae(ne(function(e,t){return 255*(1-(1-e/255)*(1-t/255))})),Z.overlay=ae(ne(function(e,t){return t<128?2*e*t/255:255*(1-2*(1-e/255)*(1-t/255))})),Z.darken=ae(ne(function(e,t){return e>t?t:e})),Z.lighten=ae(ne(function(e,t){return e>t?e:t})),Z.dodge=ae(ne(function(e,t){return e===255||(e=t/255*255/(1-e/255))>255?255:e})),Z.burn=ae(ne(function(e,t){return 255*(1-(1-t/255)/(e/255))}));for(var Xi=Z,ct=p.type,eo=p.clip_rgb,to=p.TWOPI,ao=Math.pow,no=Math.sin,ro=Math.cos,Ta=G,io=M,oo=Math.floor,so=Math.random,ut=$,ja=Math.log,lo=Math.pow,co=Math.floor,uo=Math.abs,qa=function(e,t){t===void 0&&(t=null);var a={min:Number.MAX_VALUE,max:-1*Number.MAX_VALUE,sum:0,values:[],count:0};return ut(e)==="object"&&(e=Object.values(e)),e.forEach(function(n){t&&ut(n)==="object"&&(n=n[t]),n==null||isNaN(n)||(a.values.push(n),a.sum+=n,n<a.min&&(a.min=n),n>a.max&&(a.max=n),a.count+=1)}),a.domain=[a.min,a.max],a.limits=function(n,i){return Ga(a,n,i)},a},Ga=function(e,t,a){t===void 0&&(t="equal"),a===void 0&&(a=7),ut(e)=="array"&&(e=qa(e));var n=e.min,i=e.max,o=e.values.sort(function(pt,gt){return pt-gt});if(a===1)return[n,i];var r=[];if(t.substr(0,1)==="c"&&(r.push(n),r.push(i)),t.substr(0,1)==="e"){r.push(n);for(var s=1;s<a;s++)r.push(n+s/a*(i-n));r.push(i)}else if(t.substr(0,1)==="l"){if(n<=0)throw new Error("Logarithmic scales are only possible for values > 0");var l=Math.LOG10E*ja(n),u=Math.LOG10E*ja(i);r.push(n);for(var f=1;f<a;f++)r.push(lo(10,l+f/a*(u-l)));r.push(i)}else if(t.substr(0,1)==="q"){r.push(n);for(var b=1;b<a;b++){var w=(o.length-1)*b/a,y=co(w);if(y===w)r.push(o[y]);else{var g=w-y;r.push(o[y]*(1-g)+o[y+1]*g)}}r.push(i)}else if(t.substr(0,1)==="k"){var k,_=o.length,O=new Array(_),E=new Array(a),q=!0,V=0,N=null;(N=[]).push(n);for(var h=1;h<a;h++)N.push(n+h/a*(i-n));for(N.push(i);q;){for(var x=0;x<a;x++)E[x]=0;for(var A=0;A<_;A++)for(var F=o[A],U=Number.MAX_VALUE,j=void 0,R=0;R<a;R++){var P=uo(N[R]-F);P<U&&(U=P,j=R),E[j]++,O[A]=j}for(var I=new Array(a),B=0;B<a;B++)I[B]=null;for(var Y=0;Y<_;Y++)I[k=O[Y]]===null?I[k]=o[Y]:I[k]+=o[Y];for(var oe=0;oe<a;oe++)I[oe]*=1/E[oe];q=!1;for(var se=0;se<a;se++)if(I[se]!==N[se]){q=!0;break}N=I,++V>200&&(q=!1)}for(var le={},ke=0;ke<a;ke++)le[ke]=[];for(var ve=0;ve<_;ve++)le[k=O[ve]].push(o[ve]);for(var X=[],xe=0;xe<a;xe++)X.push(le[xe][0]),X.push(le[xe][le[xe].length-1]);X=X.sort(function(pt,gt){return pt-gt}),r.push(X[0]);for(var ht=1;ht<X.length;ht+=2){var dt=X[ht];isNaN(dt)||r.indexOf(dt)!==-1||r.push(dt)}}return r},Wa={analyze:qa,limits:Ga},Va=M,Ha=M,te=Math.sqrt,W=Math.pow,fo=Math.min,ho=Math.max,za=Math.atan2,Ua=Math.abs,Oe=Math.cos,Ya=Math.sin,po=Math.exp,Qa=Math.PI,Ja=M,go=M,Ka=G,Za=st,mo={cool:function(){return Za([Ka.hsl(180,1,.9),Ka.hsl(250,.7,.4)])},hot:function(){return Za(["#000","#f00","#ff0","#fff"]).mode("rgb")}},Re={OrRd:["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"],PuBu:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"],BuPu:["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"],Oranges:["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"],BuGn:["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"],YlOrBr:["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"],YlGn:["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],Reds:["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"],RdPu:["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"],Greens:["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"],YlGnBu:["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],Purples:["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"],GnBu:["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"],Greys:["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"],YlOrRd:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],PuRd:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"],Blues:["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"],PuBuGn:["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"],Viridis:["#440154","#482777","#3f4a8a","#31678e","#26838f","#1f9d8a","#6cce5a","#b6de2b","#fee825"],Spectral:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],RdYlGn:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],RdBu:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],PiYG:["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],PRGn:["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],RdYlBu:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],BrBG:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],RdGy:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],PuOr:["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],Set2:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"],Accent:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"],Set1:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"],Set3:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"],Dark2:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"],Paired:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"],Pastel2:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"],Pastel1:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]},ft=0,Xa=Object.keys(Re);ft<Xa.length;ft+=1){var en=Xa[ft];Re[en.toLowerCase()]=Re[en]}var bo=Re,z=G;return z.average=function(e,t,a){t===void 0&&(t="lrgb"),a===void 0&&(a=null);var n=e.length;a||(a=Array.from(new Array(n)).map(function(){return 1}));var i=n/a.reduce(function(k,_){return k+_});if(a.forEach(function(k,_){a[_]*=i}),e=e.map(function(k){return new nt(k)}),t==="lrgb")return Qi(e,a);for(var o=e.shift(),r=o.get(t),s=[],l=0,u=0,f=0;f<r.length;f++)if(r[f]=(r[f]||0)*a[0],s.push(isNaN(r[f])?0:a[0]),t.charAt(f)==="h"&&!isNaN(r[f])){var b=r[f]/180*ot;l+=Ia(b)*a[0],u+=La(b)*a[0]}var w=o.alpha()*a[0];e.forEach(function(k,_){var O=k.get(t);w+=k.alpha()*a[_+1];for(var E=0;E<r.length;E++)if(!isNaN(O[E]))if(s[E]+=a[_+1],t.charAt(E)==="h"){var q=O[E]/180*ot;l+=Ia(q)*a[_+1],u+=La(q)*a[_+1]}else r[E]+=O[E]*a[_+1]});for(var y=0;y<r.length;y++)if(t.charAt(y)==="h"){for(var g=Yi(u/s[y],l/s[y])/ot*180;g<0;)g+=360;for(;g>=360;)g-=360;r[y]=g}else r[y]=r[y]/s[y];return w/=n,new nt(r,t).alpha(w>.99999?1:w,!0)},z.bezier=function(e){var t=function(a){var n,i,o,r,s,l,u;if((a=a.map(function(g){return new _e(g)})).length===2)n=a.map(function(g){return g.lab()}),s=n[0],l=n[1],r=function(g){var k=[0,1,2].map(function(_){return s[_]+g*(l[_]-s[_])});return new _e(k,"lab")};else if(a.length===3)i=a.map(function(g){return g.lab()}),s=i[0],l=i[1],u=i[2],r=function(g){var k=[0,1,2].map(function(_){return(1-g)*(1-g)*s[_]+2*(1-g)*g*l[_]+g*g*u[_]});return new _e(k,"lab")};else if(a.length===4){var f;o=a.map(function(g){return g.lab()}),s=o[0],l=o[1],u=o[2],f=o[3],r=function(g){var k=[0,1,2].map(function(_){return(1-g)*(1-g)*(1-g)*s[_]+3*(1-g)*(1-g)*g*l[_]+3*(1-g)*g*g*u[_]+g*g*g*f[_]});return new _e(k,"lab")}}else{if(!(a.length>=5))throw new RangeError("No point in running bezier with only one color.");var b,w,y;b=a.map(function(g){return g.lab()}),y=a.length-1,w=function(g){for(var k=[1,1],_=1;_<g;_++){for(var O=[1],E=1;E<=k.length;E++)O[E]=(k[E]||0)+k[E-1];k=O}return k}(y),r=function(g){var k=1-g,_=[0,1,2].map(function(O){return b.reduce(function(E,q,V){return E+w[V]*Math.pow(k,y-V)*Math.pow(g,V)*q[O]},0)});return new _e(_,"lab")}}return r}(e);return t.scale=function(){return Zi(t)},t},z.blend=Xi,z.cubehelix=function(e,t,a,n,i){e===void 0&&(e=300),t===void 0&&(t=-1.5),a===void 0&&(a=1),n===void 0&&(n=1),i===void 0&&(i=[0,1]);var o,r=0;ct(i)==="array"?o=i[1]-i[0]:(o=0,i=[i,i]);var s=function(l){var u=to*((e+120)/360+t*l),f=ao(i[0]+o*l,n),b=(r!==0?a[0]+l*r:a)*f*(1-f)/2,w=ro(u),y=no(u);return Ta(eo([255*(f+b*(-.14861*w+1.78277*y)),255*(f+b*(-.29227*w-.90649*y)),255*(f+b*(1.97294*w)),1]))};return s.start=function(l){return l==null?e:(e=l,s)},s.rotations=function(l){return l==null?t:(t=l,s)},s.gamma=function(l){return l==null?n:(n=l,s)},s.hue=function(l){return l==null?a:(ct(a=l)==="array"?(r=a[1]-a[0])===0&&(a=a[1]):r=0,s)},s.lightness=function(l){return l==null?i:(ct(l)==="array"?(i=l,o=l[1]-l[0]):(i=[l,l],o=0),s)},s.scale=function(){return Ta.scale(s)},s.hue(a),s},z.mix=z.interpolate=Sa,z.random=function(){for(var e="#",t=0;t<6;t++)e+="0123456789abcdef".charAt(oo(16*so()));return new io(e,"hex")},z.scale=st,z.analyze=Wa.analyze,z.contrast=function(e,t){e=new Va(e),t=new Va(t);var a=e.luminance(),n=t.luminance();return a>n?(a+.05)/(n+.05):(n+.05)/(a+.05)},z.deltaE=function(e,t,a,n,i){a===void 0&&(a=1),n===void 0&&(n=1),i===void 0&&(i=1);var o=function(X){return 360*X/(2*Qa)},r=function(X){return 2*Qa*X/360};e=new Ha(e),t=new Ha(t);var s=Array.from(e.lab()),l=s[0],u=s[1],f=s[2],b=Array.from(t.lab()),w=b[0],y=b[1],g=b[2],k=(l+w)/2,_=(te(W(u,2)+W(f,2))+te(W(y,2)+W(g,2)))/2,O=.5*(1-te(W(_,7)/(W(_,7)+W(25,7)))),E=u*(1+O),q=y*(1+O),V=te(W(E,2)+W(f,2)),N=te(W(q,2)+W(g,2)),h=(V+N)/2,x=o(za(f,E)),A=o(za(g,q)),F=x>=0?x:x+360,U=A>=0?A:A+360,j=Ua(F-U)>180?(F+U+360)/2:(F+U)/2,R=1-.17*Oe(r(j-30))+.24*Oe(r(2*j))+.32*Oe(r(3*j+6))-.2*Oe(r(4*j-63)),P=U-F;P=Ua(P)<=180?P:U<=F?P+360:P-360,P=2*te(V*N)*Ya(r(P)/2);var I=w-l,B=N-V,Y=1+.015*W(k-50,2)/te(20+W(k-50,2)),oe=1+.045*h,se=1+.015*h*R,le=30*po(-W((j-275)/25,2)),ke=-(2*te(W(h,7)/(W(h,7)+W(25,7))))*Ya(2*r(le)),ve=te(W(I/(a*Y),2)+W(B/(n*oe),2)+W(P/(i*se),2)+ke*(B/(n*oe))*(P/(i*se)));return ho(0,fo(100,ve))},z.distance=function(e,t,a){a===void 0&&(a="lab"),e=new Ja(e),t=new Ja(t);var n=e.get(a),i=t.get(a),o=0;for(var r in n){var s=(n[r]||0)-(i[r]||0);o+=s*s}return Math.sqrt(o)},z.limits=Wa.limits,z.valid=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];try{return new(Function.prototype.bind.apply(go,[null].concat(e))),!0}catch{return!1}},z.scales=mo,z.colors=da,z.brewer=bo,z})});var bt=[{key:"black hot",name:"Black hot",steps:[{color:"#F5F5F5",value:0},{color:"#242124",value:1}],type:"relative"},{device_class:"carbon_dioxide",documentation:{text:`<p>CO\u2082 levels reflect the amount of fresh air in a space. High levels
indicate insufficient ventilation. The specific effects of higher
concentrations of CO\u2082 are highly individual, but studies have shown
that levels over 1000 ppm cause cognitive impairment in many
individuals.</p>
<p>Levels over 2000 ppm have been linked to health effects in some
studies. There is no conclusive sum of evidence.</p>
<p>This scale caps at 3000 ppm, as a maximum level that'd signify
fairly bad air. Levels above 5000 ppm are considered dangerous
in workplace standards (f.x OSHA in the US) and are indicative
of greatly insufficient ventilation overall.</p>`},key:"carbon dioxide",name:"CO\u2082, indoor exposure",steps:[{color:"#6d9b17",value:520},{color:"#FFBF00",value:1e3},{color:"#cf0000",value:1400},{color:"#5b0f8c",value:3e3}],type:"absolute"},{documentation:{license:{name:"Apache License 2.0",url:"https://www.apache.org/licenses/LICENSE-2.0"},text:`<p>Colors by Cynthia Brewer, <a href="https://colorbrewer2.org" rel="noopener" target="_blank">colorbrewer2.org</a>.
ColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>`},key:"colorbrewer 5cl bugn",name:"ColorBrewer 5-class BuGn",steps:[{color:"#edf8fb",value:0},{color:"#b2e2e2",value:.25},{color:"#66c2a4",value:.5},{color:"#2ca25f",value:.75},{color:"#006d2c",value:1}],type:"relative"},{documentation:{license:{name:"Apache License 2.0",url:"https://www.apache.org/licenses/LICENSE-2.0"},text:`<p>Colors by Cynthia Brewer, <a href="https://colorbrewer2.org" rel="noopener" target="_blank">colorbrewer2.org</a>.
ColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>`},key:"colorbrewer 5cl bupu",name:"ColorBrewer 5-class BuPu",steps:[{color:"#edf8fb",value:0},{color:"#b3cde3",value:.25},{color:"#8c96c6",value:.5},{color:"#8856a7",value:.75},{color:"#810f7c",value:1}],type:"relative"},{documentation:{license:{name:"Apache License 2.0",url:"https://www.apache.org/licenses/LICENSE-2.0"},text:`<p>Colors by Cynthia Brewer, <a href="https://colorbrewer2.org" rel="noopener" target="_blank">colorbrewer2.org</a>.
ColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>`},key:"colorbrewer 5cl rdpu",name:"ColorBrewer 5-class BuPu",steps:[{color:"#feebe2",value:0},{color:"#fbb4b9",value:.25},{color:"#f768a1",value:.5},{color:"#c51b8a",value:.75},{color:"#7a0177",value:1}],type:"relative"},{documentation:{license:{name:"Apache License 2.0",url:"https://www.apache.org/licenses/LICENSE-2.0"},text:`<p>Colors by Cynthia Brewer, <a href="https://colorbrewer2.org" rel="noopener" target="_blank">colorbrewer2.org</a>.
ColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>`},key:"colorbrewer 5cl ylorbr",name:"ColorBrewer 5-class YlOrBr",steps:[{color:"#ffffd4",value:0},{color:"#fed98e",value:.25},{color:"#fe9929",value:.5},{color:"#d95f0e",value:.75},{color:"#993404",value:1}],type:"relative"},{device_class:"temperature",documentation:{text:`<p>Indoor temperatures related to human comfort levels. Amalgation
of multiple sources. As always with temperature, individual
factors such as generics, clothing and activity level have a big
impact.</p>`},key:"indoor temperature",name:"Indoor temperature",steps:[{color:"#0f3489",value:12},{color:"#595ea3",value:16},{color:"#7374b0",value:18},{color:"#F5F5F5",value:20},{color:"#F5F5F5",value:22},{color:"#ea755a",value:24},{color:"#cf0000",value:28}],type:"absolute",unit:"\xB0C"},{key:"iron red",name:"Iron red",steps:[{color:"#230382",value:0},{color:"#921C96",value:.1},{color:"#C93F55",value:.25},{color:"#DF6D2D",value:.4},{color:"#EFB03D",value:.6},{color:"#F9DE52",value:.75},{color:"#F5F5D4",value:1}],type:"relative"},{device_class:"temperature",documentation:{text:`<p>Outdoor temperatures related to human comfort and risk levels.</p>
<p>Note that this works best when using apparent (or <a href="https://en.wikipedia.org/wiki/Wet-bulb_temperature" rel="noopener" target="_blank">wet bulb</a>)
temperature and taking wind chill into account, not just <a href="https://en.wikipedia.org/wiki/Dry-bulb_temperature" rel="noopener" target="_blank">dry bulb</a>
temperature, such as a like a thermometer reading.</p>
<p>Individual factors such as clothing, activity level, wind speed and
exposure to sun all play a part in how we perceive temperature.
See this is a rough guideline.</p>`},key:"outdoor temperature",name:"Outdoor temperature",steps:[{color:"#0f3489",legend:"Severe risk of frostbite",value:-30},{color:"#595ea3",legend:"Risk of frostbite",value:0},{color:"#7374b0",legend:"Risk of hypothermia",value:10},{color:"#7374b0",legend:"Chilling temperatures",value:15},{color:"#F5F5F5",value:22},{color:"#F5F5F5",value:27},{color:"#ea755a",legend:"Risk of heat cramps or exhaustion",value:32},{color:"#cf0000",legend:"Heat exhaustion more likely",value:40},{color:"#5b0f8c",legend:"Heat stroke risk",value:54}],type:"absolute",unit:"\xB0C"},{device_class:"pm25",documentation:{text:`<p>This scale is based on an aggregate of the World Health Organization
<a href="https://www.who.int/publications/i/item/9789240034228" rel="noopener" target="_blank">global air quality guidelines</a> 
and <a href="https://www.who.int/publications/i/item/9789240000278" rel="noopener" target="_blank">Personal interventions and risk communication on Air Pollution</a>
reports.</p>
<p>The lowest part of the range map to the AQG (Air Quality Goal)
target, a PM<sub>2.5</sub> level of &lt;5 \u03BCg/m<sup>3</sup> which is considered relatively safe.
The upper part, &gt;100 \u03BCg/m<sup>3</sup>, is considered the level where the 
health benefits of regular physical activity is greatly offset by the
PM<sub>2.5</sub> exposure.</p>
<p>Note that the level of &lt;5 \u03BCg/m<sup>3</sup> is the AQG exposure
level on an annaul basis. The WHO also has a 24-hour AQG level of
&lt;15 \u03BCg/m<sup>3</sup> which is not included in this scale. As we're
trending patterns over time, the annual target made more sense for
the heatmap.</p>`},key:"pm25",name:"PM2.5 (WHO aggregate)",steps:[{color:"#6d9b17",legend:"AQG level",value:5},{color:"#FFBF00",legend:"Interim target 2",value:25},{color:"#cf0000",value:50},{color:"#5b0f8c",legends:"Risk level",value:100}],type:"absolute",unit:"\xB5g/m\xB3"},{key:"stoplight",name:"Stoplight",steps:[{color:"#6d9b17",value:0},{color:"#fde74c",value:.5},{color:"#cf0000",value:1}],type:"relative"},{key:"white hot",name:"White hot",steps:[{color:"#242124",value:0},{color:"#F5F5F5",value:1}],type:"relative"},{device_class:"temperature",documentation:{license:{name:"Creative Commons Attribution-ShareAlike License 3.0",url:"https://creativecommons.org/licenses/by-sa/3.0/"},text:`<p>Wikipedia's <a href="https://en.wikipedia.org/wiki/Module:Weather" rel="noopener" target="_blank">Weather</a> template temperature graph color scheme, cool2 version.
Slightly modified by setting the minimum to -60\xB0C, instead of -90\xB0C.</p>`},key:"wikipedia climate cool2",name:"Wikipedia climate, cool2",steps:[{color:"#0000A2",value:-60},{color:"#0000D7",value:-43},{color:"#6565FF",value:-24},{color:"#FCFCFF",value:4},{color:"#FF7F00",value:23},{color:"#FF2C00",value:35},{color:"#F60000",value:42},{color:"#000000",value:56}],type:"absolute",unit:"\xB0C"}];var ce={apparent_power:{},atmospheric_pressure:{},aqi:{},battery:{},carbon_dioxide:{default:"carbon dioxide"},carbon_monoxide:{},current:{},date:{},duration:{},energy:{},frequency:{},gas:{},humidity:{},illuminance:{},monetary:{},nitrogen_dioxide:{},nitrogen_monoxide:{},nitrous_oxide:{},ozone:{},pm1:{},pm10:{},pm25:{default:"pm25"},power_factor:{},power:{},pressure:{},reactive_power:{},signal_strength:{},sulphur_dioxide:{},temperature:{default:"outdoor temperature",unit_system:"temperature"},timestamp:{},volatile_organic_compounds:{},voltage:{}};var wt=Fo(tn()),Ie={temperature:{"\xB0C":{"\xB0F":S=>parseInt(S*1.8+32)},"\xB0F":{"\xB0C":S=>parseInt((S-32)/1.8)}}},ye=class{constructor(){this.default_scale="iron red",this.scale_by_key={};for(let c of bt)this.scale_by_key[c.key]=c}get_scale(c,d="",m={}){if(c===void 0&&(c=this.default_scale),typeof c=="string")return this.generate_scale(this.scale_by_key[c],d,m);var v=this.generate_scale(c,d,m);return delete v.docs,v}generate_scale(c,d=void 0,m={}){var v=[],C=[],$=c.unit,L=D=>D;if(c.unit&&d&&m){let D=ce[d].unit_system,p=m[D];D&&p&&c.unit!==p&&Ie[D]&&Ie[D][c.unit]&&Ie[D][c.unit][p]&&($=p,L=Ie[D][c.unit][p])}for(let D of c.steps)v.push(D.color),"value"in D&&(D.value=L(D.value),C.push(D.value));var T;return C.length>0&&C.length==v.length?T=wt.default.scale(v).domain(C):T=wt.default.scale(v),{gradient:T,type:c.type??"relative",name:c.name,key:c.key,steps:c.steps,unit:$,docs:c.documentation,css:this.legend_css_by_gradient(T)}}legend_css_by_gradient(c){var d=[];for(let[m,v]of c.colors(21).entries())d.push(`${v} ${m*5}%`);return d.join(", ")}defaults_for(c){return c in ce&&"default"in ce[c]?ce[c].default:this.default_scale}get_by(c,d){var m=bt.filter(v=>v[c]===d);return m.map(v=>this.get_scale(v))}};var _t=Object.getPrototypeOf(customElements.get("ha-panel-lovelace")),ee=_t.prototype.html,Ao=_t.prototype.css,$e=class extends _t{hass_inited=!1;scales=new ye;static get properties(){return{hass:{},config:{},grid:[],grid_status:void 0,meta:{},tooltipOpen:!1,selected_element_data:""}}render(){return this.grid===void 0&&(this.grid=[]),ee`
            <ha-card header="${this.meta.title}" id="card">
                <div class="card-content">
                    <table>
                        <thead>
                            <tr class="hr${this.myhass.locale.time_format}">
                                <th class="hm-row-title">${this.myhass.localize("ui.dialogs.helper_settings.input_datetime.date")}</th>
                                ${this.date_table_headers()}
                            </tr>
                        </thead>
                        <tbody>
                    ${this.grid.map((c,d)=>ee`<tr>
                            <td class="hm-row-title">${c.date}</td>
                            ${c.vals.map((m,v)=>{var C="hm-box",$=m;if($===null&&(C+=" null"),this.meta.scale.type==="relative"){let T=this.meta.data.max-this.meta.data.min;$=(m-this.meta.data.min)/T,$<0&&($=0),$>1&&($=1)}let L=this.meta.scale.gradient($);return ee`<td @click="${this.toggle_tooltip}" class="${C}" data-val="${m}" data-row="${d}" data-col="${v}" style="color: ${L}"></td>`})}
                        </tr>`)}
                        </tbody>
                    </table>
                    ${this.render_status()}
                    ${this.render_legend()}
                    ${this.render_tooltip()}
                </div>
            </ha-card>
        `}date_table_headers(){return this.myhass.locale.time_format==="12"?ee`
                <th>12<br/>AM</th><th>·</th><th>·</th><th>·</th><th>4<br/>AM</th><th>·</th><th>·</th><th>·</th>
                <th>8<br/>AM</th><th>·</th><th>·</th><th>·</th><th>12<br/>PM</th><th>·</th><th>·</th><th>·</th>
                <th>4<br/>PM</th><th>·</th><th>·</th><th>·</th><th>8<br/>PM</th><th>·</th><th>·</th><th>11<br/>PM</th>
            `:ee`
                <th>00</th><th>·</th><th>·</th><th>·</th><th>04</th><th>·</th><th>·</th><th>·</th>
                <th>08</th><th>·</th><th>·</th><th>·</th><th>12</th><th>·</th><th>·</th><th>·</th>
                <th>16</th><th>·</th><th>·</th><th>·</th><th>20</th><th>·</th><th>·</th><th>23</th>
            `}render_status(){if(this.grid_status)return ee`<h3>${this.grid_status}</h3>`}render_legend(){if(this.config.display.legend===!1)return;let c=this.legend_scale(this.meta.scale);return ee`
            <div class="legend-container">
                <div id="legend" style="background: linear-gradient(90deg, ${this.meta.scale.css})"></div>
                <div class="tick-container">
                    ${c.map(d=>ee`
                        <div class="legend-tick" style="left: ${d[0]}%;"">
                            <div class="caption">${d[1]} ${this.meta.scale.unit}</div>
                        </div>
                        <span class="legend-shadow">${d[1]} ${this.meta.scale.unit}</span>`)}
                </div>
            </div>
        `}render_tooltip(){var c="";if(this.selected_element_data){let $=this.grid[this.selected_element_data.row]?.date,L=parseInt(this.selected_element_data.col);var d=new Date("2022-03-20 00:00:00").setHours(L),m=new Date("2022-03-20 00:00:00").setHours(L+1),v;this.selected_element_data.val===""?v=this.myhass.localize("ui.components.data-table.no-data"):v=`${+parseFloat(this.selected_element_data.val).toFixed(2)} ${this.meta.scale.unit||this.meta.unit_of_measurement}`;var C=new Intl.DateTimeFormat("sv-SE",{hour:"numeric",minute:"numeric"});this.myhass.locale.time_format=="12"&&(C=new Intl.DateTimeFormat("en-US",{hour:"numeric"})),c=ee`<div class="meta">${$} ${C.format(d)} - ${C.format(m)}</div><div class="value">${v}</div>`}return ee`
            <div id="tooltip" class="${this.tooltipOpen?"active":"hidden"}">${c}</div>
        `}legend_scale(c){var d=[];if(c.type==="relative")for(var m=this.meta.data.max-this.meta.data.min,v=0;v<=5;v++)d.push([v*20,+Number(this.meta.data.min+m/5*v).toFixed(2)]);else{var C=c.steps[0].value,$=c.steps[c.steps.length-1].value,L=$-C;for(let T of c.steps)d.push([(T.value-C)/L*100,T.value])}return d}toggle_tooltip(c){let d=this.renderRoot.querySelector("#selected"),m=this.renderRoot.querySelector("#card"),v=this.renderRoot.querySelector("#tooltip"),C=c.target;if(d&&(d.removeAttribute("id"),d===c.target)){this.tooltipOpen=!1;return}this.tooltipOpen=!0,C.id="selected";var $=C.getBoundingClientRect(),L=m.getBoundingClientRect(),T=$.top-L.top,D=$.left-L.left;v.style.top=(T-50-$.height).toString()+"px",v.style.left=(D-$.width/2-70).toString()+"px",this.selected_element_data=C.dataset}set hass(c){if(this.hass_inited!==!0){this.myhass=c,this.meta=this.populate_meta(c);var d=[this.config.entity];this.get_recorder(d,this.config.days),this.hass_inited=!0}}get_recorder(c,d){let m=new Date;this.grid_status=void 0;var v=new Date(m-d*864e5);v.setHours(23,0,0),this.myhass.callWS({type:"recorder/statistics_during_period",statistic_ids:c,period:"hour",units:{energy:"kWh",temperature:this.myhass.config.unit_system.temperature},start_time:v.toISOString(),types:["sum","mean"]}).then(C=>{for(let $ of c){let L=C[$];if(L===void 0){this.grid=[],this.grid_status=this.myhass.localize("ui.components.data-table.no-data");continue}switch(this.meta.state_class){case"measurement":this.grid=this.calculate_measurement_values(L);break;case"total":case"total_increasing":this.grid=this.calculate_increasing_values(L);break;default:throw new Error(`Unknown state_class defined (${this.meta.state_class} for ${$}.`)}}(this.config.data.max===void 0||this.config.data.max==="auto")&&(this.meta.data.max=this.max_from(this.grid)),(this.config.data.min===void 0||this.config.data.min==="auto")&&(this.meta.data.min=this.min_from(this.grid))})}max_from(c){var d=[];for(let m of c)d=d.concat(m.vals);return Math.max(...d)}min_from(c){var d=[];for(let m of c)d=d.concat(m.vals);return Math.min(...d)}calculate_measurement_values(c){var d=[],m=[],v=null,C;for(let $ of c){let L=new Date($.start);C=L.getHours();let T=L.toLocaleDateString(this.meta.language,{month:"short",day:"2-digit"});T!==v&&v!==null&&(m=Array(24).fill(null),d.push({date:T,nativeDate:L,vals:m})),m[C]=$.mean,v=T}return m.splice(C+1),d.reverse()}calculate_increasing_values(c){var d=[],m=null,v=[],C=null,$;for(let T of c){let D=new Date(T.start);$=D.getHours();let p=D.toLocaleDateString(this.meta.language,{month:"short",day:"2-digit"});if(p!==C&&m!==null&&(v=Array(24).fill(0),d.push({date:p,nativeDate:D,vals:v})),m!==null){var L=(T.sum-m).toFixed(2);v[$]=L}m=T.sum,C=p}return v.splice($+1),d.reverse()}populate_meta(c){let d=c.states[this.config.entity].attributes,m=d.device_class??this.config.device_class;var v={unit_of_measurement:d.unit_of_measurement,state_class:d.state_class,device_class:m,language:c.selectedLanguage??c.language??"en",scale:this.scales.get_scale(this.config.scale??this.scales.defaults_for(m),m,this.myhass.config.unit_system),title:this.config.title??(this.config.title===null?void 0:d.friendly_name),data:{max:this.config.data.max,min:this.config.data.min}};return v}setConfig(c){if(!c.entity)throw new Error("You need to define an entity");if(c.days&&c.days<=0)throw new Error("`days` need to be 1 or higher");if(this.config={title:c.title,days:c.days??21,entity:c.entity,scale:c.scale,data:c.data??{},display:c.display??{}},this.config.data.max!==void 0&&this.config.data.max!=="auto"&&typeof this.config.data.max!="number")throw new Error("`data.max` need to be either `auto` or a number");if(this.config.data.min!==void 0&&this.config.data.min!=="auto"&&typeof this.config.data.min!="number")throw new Error("`data.min` need to be either `auto` or a number");this.hass_inited=!1}getCardSize(){return this.config.days?1+Math.ceil(this.config.days/6):1}static getConfigElement(){return document.createElement("heatmap-card-editor")}};Be($e,"styles",Ao`
            /* Heatmap table */
            table {
                border: none;
                border-spacing: 0px;
                table-layout:fixed;
                width: 100%;
                pointer-events: none;
                user-drag: none;
                user-select: none;
                color: var(--secondary-text-color);
            }
            th {
                position:relative;
                font-weight: normal;
                vertical-align: bottom;
            }
            th:not(.hm-row-title) {
                text-align: center;
                white-space: nowrap;
            }
            /* Used for 12hr displays; we need space for two lines */
            tr.hr12 th:not(.hm-row-title) {
                font-size: 70%;
            }
            tr {
                line-height: 1.1;
                overflow: hidden;
                font-size: 90%;
            }
            .hm-row-title {
                text-align: left;
                max-height: 20px;
                min-width: 50px;
                width: 50px;
            }
            .hm-box {
                background-color: currentcolor;
                pointer-events: auto;
            }
            #selected {
                outline: 6px currentcolor solid;
                z-index: 2;
                margin: 3px;
                position: relative;
                box-shadow: 0px 0px 0px 7px rgba(0,0,0,1), 0px 0px 0px 8px rgba(255,255,255,1);
            }

            /* Legend */
            .legend-container {
                margin-top: 20px;
                width: 80%;
                margin-left: auto;
                margin-right: 5%;
                position: relative;

            }
            .tick-container {
                position: relative:
                left: -10px;
            }
            #legend {
                height: 10px;
                outline-style: solid;
                outline-width: 1px;
                /*
                    Background is set via the style attribute in the object while rendering,
                    as lit-element and CSS templating is a bit of a PITA.
                */
            }

            .legend-tick {
                position: absolute;
                top: 10px;
                height: 10px;
                vertical-align: bottom;
                border-left-style: solid;
                border-left-width: 1px;
                white-space: nowrap;
                text-align: right;
                opacity: 0.7;
            }

            .legend-container .caption {
                position: relative;
                top: -15px;
                transform: translateY(100%) rotate(90deg);
                transform-origin: center left;
                font-size: 80%;
                text-align: left;
            }

            /*
                We use a non-visible shadow copy of the tick captions
                to get a height for the element. As the ticks themselves
                are position: absolute'd, we can't use their height for
                this purpose without some JS kludging.
            */
            span.legend-shadow {
                margin-top: 15px;
                position: relative;
                border-color: red;
                border-style: solid;
                writing-mode: vertical-rl;
                transform-origin: bottom left;
                font-size: 80%;
                line-height: 0.2;
                visibility: hidden;
            }

            /* Detail view */
            #tooltip {
                display: none;
                z-index: 1;
                position: absolute;
                padding: 6px;
                border-radius: 4px;
                background: var(--ha-card-background, var(--card-background-color, white) );
                border-color: currentcolor;
                border-width: 1px;
                border-style: solid;
                white-space: nowrap;
            }
            #tooltip.active {
                display: block;
            }
            #tooltip div.meta {
                font-size: 90%;
            }
            #tooltip div.value {
                font-size: 120%;
            }
        `);var kt=Object.getPrototypeOf(customElements.get("ha-panel-lovelace")),Q=kt.prototype.html,Eo=kt.prototype.css;function So(S){var c=[S];return c.raw=!0,Q(c)}var Me=class extends kt{scales=new ye;static get properties(){return{_config:{},active_tab:void 0,entity:void 0,device_class:void 0,scale:void 0}}set hass(c){this.myhass=c}async setConfig(c){this._config=c;var d=await loadCardHelpers();customElements.get("ha-entity-picker")||await(await d.createCardElement({type:"entities",entities:[]})).constructor.getConfigElement(),this.entity=this.myhass.states[this._config.entity],this.device_class=(this.entity&&this.entity.attributes.device_class)??this._config.device_class,this.scale=this.scales.get_scale(this._config.scale),this.active_tab===void 0&&this._config.scale&&(this.active_tab=this.tab_from_scale(this._config.scale))}tab_from_scale(c){return typeof c=="object"?2:this.scales.get_scale(c).type==="relative"?1:0}render_device_class_picker(){let c=Object.keys(ce).map(function(d){return{label:d,value:d}});if(this.entity&&!this.entity.attributes.device_class)return Q`
                <ha-combo-box
                    .label=${"Device class"}
                    .hass=${this.myhass}
                    .configValue=${"device_class"}
                    .items=${c}
                    .value=${this._config.device_class??""}
                    .allowCustomValue=${!1}
                    .helper=${"What device_class best represents this entity?"}
                ></ha-combo-box>
            `}render_scale_docs(c){if(this.scale!==void 0){var d;if(!(this.scale.docs===void 0||this.scale.type!==c))return this.scale.docs?.license&&(d=Q`
                <h4>Scale license</h4>
                <p>
                    This scale is licensed separately from the heatmap card
                    under <a href="${this.scale.docs.license.url}" target="_blank">${this.scale.docs.license.name}</a>.
                </p>
            `),Q`
            <div class="scale-docs">
                <h3>About this scale</h3>
                ${So(this.scale.docs?.text)}
                ${d}
            </div>
        `}}render_tab_bar(){return this.device_class?Q`
            <mwc-tab-bar
                @MDCTabBar:activated=${d=>{for(let m of this.renderRoot.querySelectorAll(".scale-picker-content"))m.style.display="none";this.renderRoot.querySelector(`#tab-idx-${d.detail.index}`).style.display="block"}}
                .activeIndex=${this.active_tab??0}
            >
                <mwc-tab label="Absolute"></mwc-tab>
                <mwc-tab label="Relative"></mwc-tab>
                <mwc-tab label="Custom"></mwc-tab>
            </mwc-tab-bar>
            <div class="scale-picker-content" id="tab-idx-0">
                ${this.render_absolute_scale_picker()}
                ${this.render_scale_docs("absolute")}
            </div>
            <div class="scale-picker-content" id="tab-idx-1">
                ${this.render_relative_scale_picker()}
                ${this.render_scale_docs("relative")}
            </div>
            <div class="scale-picker-content" id="tab-idx-2">
                <h3>Custom scale</h3>
                <p>There's no GUI support for setting a custom scale; use the code editor.</p>
                <p>See <a href="https://github.com/kandsten/ha-heatmap-card#custom-color-scales">
                the card README</a> for the config reference.</p>
            </div>
        `:void 0}render_absolute_scale_picker(){var c;let d=this.scales.get_by("device_class",this.device_class);return typeof this._config.scale=="object"?c=Q`Using a custom scale, picker disabled`:d.length===0?c=Q`There are no predefined scales for this device class`:c=Q`
                ${d.map(m=>Q`
                    <ha-formfield .label=${m.name} @change=${this.update_field}>
                        <ha-radio
                            .checked=${m.key===this._config.scale}
                            .value=${m.key}
                            .configValue=${"scale"}
                        ></ha-radio>
                    </ha-formfield><br>
                `)}
            `,Q`
            <div>
                <h3>Scales for this device class</h3>
                ${c}
            </div>
        `}render_relative_scale_picker(){var c,d=this.scales.get_by("type","relative").map(function(v){return{label:v.name,value:v.key,css:v.css}});if(typeof this._config.scale=="object")c=Q`Using a custom scale, picker disabled`;else{var m=v=>Q`
            <ha-list-item>
                <div style="display: inline-block; margin-right: 15px; width: 120px; height: 12px; background: linear-gradient(90deg, ${v.css});"></div> ${v.label}
            </ha-list-item>`;c=Q`
                <ha-combo-box
                    .label=${"Scale"}
                    .hass=${this.myhass}
                    .configValue=${"scale"}
                    .items=${d}
                    .value=${this._config.scale}
                    .renderer=${m}
                    .allowCustomValue=${!0}
                > </ha-combo-box>
            `}if(this.entity&&this.device_class)return Q`
                <h3>Color scales</h3>
                    ${c}
                <h3>Range</h3>
                <div>
                    <ha-textfield
                        .label=${"Minimum value"}
                        .value=${this._config.data?.min??"auto"}
                        .placeholder=0
                        .disabled=${this._config.data?.min==="auto"||this._config.data?.min===void 0}
                        .configValue=${"data.min"}
                        @input=${this.update_field}
                        ></ha-textfield>
                    <ha-formfield .label=${"Infer from the sensor data"} @change=${this.update_field}>
                        <ha-checkbox
                            .label=${"Auto"}
                            .checked=${this._config.data?.min==="auto"||this._config.data?.min===void 0}
                            .value=${"auto"}
                            .configValue=${"data.min"}
                        ></ha-checkbox>
                    </ha-formfield>
                </div>
                <div>
                    <ha-textfield
                        .label=${"Maximum value"}
                        .value=${this._config.data?.max??"auto"}
                        .disabled=${this._config.data?.max==="auto"||this._config.data?.max===void 0}
                        .configValue=${"data.max"}
                        @input=${this.update_field}
                    ></ha-textfield>
                    <ha-formfield .label=${"Infer from the sensor data"} @change=${this.update_field}>
                        <ha-checkbox
                            .label=${"Auto"}
                            .checked=${this._config.data?.max==="auto"||this._config.data?.max===void 0}
                            .value=${"auto"}
                            .configValue=${"data.max"}
                        ></ha-checkbox>
                    </ha-formfield>
                </div>
                `}render_entity_warning(){if(this.entity!==void 0&&(this.entity.attributes?.state_class===void 0||["measurement","total","total_increasing"].includes(this.entity.attributes?.state_class)===!1))return Q`
                    <ha-alert
                        .title=${"Warning"}
                        .type=${"warning"}
                        own-margin
                    >
                        <div>
                            <p>This entity has a <code>state_class</code> attribute set to
                            <i>${this.entity.attributes?.state_class??"undefined"}</i>.</p>
                            <p>This means that data won't be saved to Long Term Statistics, which
                            we use to drive the heatmap; no results will be shown.</p>
                        </div>
                    </ha-alert>
                `}render(){if(!(this.myhass===void 0||this._config===void 0))return Q`
        <div class="root card-config">
            <ha-entity-picker
                .required=${!0}
                .hass=${this.myhass}
                .value=${this._config.entity}
                .configValue=${"entity"}
                .includeDomains=${"sensor"}
            ></ha-entity-picker>
            ${this.render_entity_warning()}
            ${this.render_device_class_picker()}
            <ha-textfield
                .label=${"Days"}
                .placeholder=${21}
                .type=${"number"}
                .value=${this._config.days}
                .configValue=${"days"}
                @input=${this.update_field}
                .helper=${"Days of data to include in the heatmap. Defaults to 21"}
                .helperPersistent=${!0}
            ></ha-textfield>
            ${this.render_tab_bar()}
            <h3>Card elements</h3>
            <ha-textfield
                .label=${"Card title"}
                .placeholder=${this.entity&&this.entity.attributes.friendly_name||""}
                .value=${this._config.title||""}
                .configValue=${"title"}
                @input=${this.update_field}
                ></ha-textfield>
        </div>`}update_field(c){c.stopPropagation();let d=c.target.value;if(this.disabled||d===void 0||d===this.value)return;let m=new Event("value-changed",{bubbles:!0});"checked"in c.target?m.detail={value:c.target.checked===!0?d:0}:isNaN(parseFloat(d))?m.detail={value:d}:m.detail={value:parseFloat(d)},c.target.dispatchEvent(m)}createRenderRoot(){let c=super.createRenderRoot();return c.addEventListener("value-changed",d=>{d.stopPropagation();let m=d.target.configValue,v=d.detail.value;var C=JSON.parse(JSON.stringify(this._config));if(m==="device_class"&&(C.scale=this.scales.defaults_for(v),this.active_tab=this.tab_from_scale(C.scale)),m==="entity"){let D=this.myhass.states[v],p=D&&D.attributes.device_class;p&&(C.scale=this.scales.defaults_for(p),this.active_tab=this.tab_from_scale(C.scale),delete C.device_class)}var $=C,L=m;if(m.indexOf(".")){for(let D of m.split(".").slice(0,-1))$[D]===void 0&&($[D]={}),$=$[D];L=m.split(".").slice(-1)}$[L]=v;let T=new Event("config-changed");T.detail={config:C},this.dispatchEvent(T)}),c}};Be(Me,"styles",Eo`
        .root > * {
            display: block;
        }
        .root > *:not([own-margin]):not(:last-child) {
            margin-bottom: 24px;
        }
        ha-alert[own-margin] {
            margin-bottom: 4px;
        }


        a:link, a:visited {
            color: var(--primary-color);
        }

        .scale-docs {
            margin-left: 2em;
            margin-right: 2em;
            word-wrap: break-word;
        }

        /* Don't mess with the line spacing */
        sup, sub {
            line-height: 0;
        }
    `);customElements.define("heatmap-card",$e);customElements.define("heatmap-card-editor",Me);window.customCards=window.customCards||[];window.customCards.push({type:"heatmap-card",name:"Heatmap card",preview:!0,description:"Heat maps of entities or energy data"});})();
/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2019, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------
 *
 * chroma.js includes colors from colorbrewer2.org, which are released under
 * the following license:
 *
 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
 * and The Pennsylvania State University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * ------------------------------------------------------
 *
 * Named colors are taken from X11 Color Names.
 * http://www.w3.org/TR/css3-color/#svg-color
 *
 * @preserve
 */
