# javascript-operator-overloader

# Caveats
JavaScript does not support operator overloading out of the box. This is an attempt to solve that problem, but there are certain pitfalls you should be aware of before considering this:
 - Calculation results must be passed to a new object, so instead of (p1 + p2 + p3) you have to do new point(p1 + p2 + p3), (given your user defined object is named "point").
 - Only +, -, * and / are supported, the fifth arithmetic opperator % is not.
 - Coercion to strings (""+p1) and comparisons (p1 == p2) will not work as expected. New functions should be built for these purposes if needed, like (p1.val == p2.val).
 - Finally the computational resources needed to calculate the answer increases quadratically with the number of terms. Therefore only 6 terms is allowed in one calculation per default (althohug you can easily increase this). For longer calculation chains than that, split the calculations up, like: new point(new point(p1 + p2 + p3 + p4 + p5 + p6) + new point(p7 + p8 + p9 + p10 + p11 + p12))

# Technical explanation
When JavaScript applies arethmetic opperations on objects it actually applies it to the result of a call to object.valueOf(). We can pass the objects to a global variable when valueOf() is called, but we get no direct information about the operations applied directly. 
This script works is by passing numbers from the valueOf() function in a way so that the operations can be deduced from the final result. This is why the final result of a calculation must be passed to a new instance of the given object type.

# Documented minimal example 
	<script type="text/javascript" src="/static/lib/operator-overloader.js"></script>
	<script>
		// Lets define an object that handles coordinate points.
		// Our object MUST be able to be initiated with the first argument alone.
		// pass arrays or objects if you need more
		function point(value){
			// We can optionally change the maximum amount of terms as such, but calculation chain length correlates to required CPU computation in an exponentially increasing fashion. 
			this.max_terms = 7;
			
			this.value = value;
			
			// ValueOf is responsible for returning the magic numbers to the JavaScript engine, which in turn allows us to deduce what operations were done on our objects.
			// The three lines below should just be copy pasted as is.
			this.valueOf = function(){
				return overload_valueOf(this);
			}
			
			// This is completely optional but left in this minimal example so we can log the value of our point objects below.
			this.toString = function(){
				return "("+this.value[0]+", "+this.value[1]+")";
			}
			
			// This functino should be called after all initialization has been done, so put it at the end. It checks if if the value passed to this object was in fact the result of previous calculations and if so it overwrites the variables of this object with the result. It returns true if this is actually the result of calculations, or false otherwise. Very CPU intensive, so do not call twice.
			overload_new_value(this);
		}
    
		// The following four static functions are needed in order to compute +, -, * and / 
		// The names of these functions are hardcoded in the project and should not be changed.

		// Addition
		point.opp_add = function(obj1, obj2){
			return new point(obj1.x + obj2.x, obj1.y + obj2.y);
		}
		
		// Subtraction
		point.opp_sub = function(obj1, obj2){
			return new point(obj1.x - obj2.x, obj1.y - obj2.y);
		}
		
		// Multiplication
		point.opp_mul = function(obj1, obj2){
			return new point(obj1.x * obj2.x, obj1.y * obj2.y);
		}
		// Division
		point.opp_div = function(obj1, obj2){
			return new point(obj1.x / obj2.x, obj1.y / obj2.y);
		}
		
		// That's it, we are now ready for an example.
		var p1 = new point([1, 2]);
		var p2 = new point([3, 4]);
	  
		// Notice we have to "catch" the calculation results inside a new point object.
		console.log("Addition: ", p1.toString() + " + " + p2.toString() + " = " + new point(p1 + p2).toString());
    
		// There is a fifth optional static function used only for supporting negative first terms.
		point.opp_inv = function(obj1){
			return new point(-obj1.x, -obj1.y);
		}
		
		console.log("Inversion: ", new point(-p1).toString());
    
		// Let's put it all together.
		var p3 = new point([8, 4]);
		var p4 = new point([3, 7]);
		var p5 = new point([2, 3]);
		var p6 = new point([6, 14]);

		console.log("Inversion and chained crazyness: ", new point(-p1 + p2 * p3 - p4 / p5 / p6).toString());
	</script>
