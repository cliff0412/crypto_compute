class MontgomeryReducer {
    constructor(mod, bitLength) {
        // Modulus
        if (mod < 3n || mod % 2n === 0n) {
            throw new Error("Modulus must be an odd number at least 3");
        }
        this.modulus = mod;

        // Reducer
        this.reducerbits = (Math.floor(bitLength /8) + 1) * 8;  // This is a multiple of 8
        this.reducer = BigInt(1) << BigInt(this.reducerbits); 
        this.mask = this.reducer - BigInt(1);

        // if (this.reducer <= mod || gcd(this.reducer, mod) !=1) {
        //     throw new Error("Invalid reducer");
        // }

        // Other computed numbers
        this.reciprocal = MontgomeryReducer.reciprocalMod(this.reducer % mod, mod);
        this.factor = (this.reducer * this.reciprocal - 1n) / mod;
        this.convertedOne = this.reducer % mod;
    }

    /**
     * convert x into the Montgomery Space, x*r % n
     * @param {*} x The range of x is unlimited
     * @returns 
     */
    convertIn(x) {
        return (x * BigInt(1) << BigInt(this.reducerbits)) % this.modulus;
    }

    /**
     * convert a value in Montgomery Space back to normal int, m * n', where n' = n^-1 mod r
     * @param {*} m  
     * @returns 
     */
    convertOut(m) {
        return (m * this.reciprocal) % this.modulus;
    }

    /**
     * Inputs and output are in Montgomery form and in the range [0, modulus)
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */ 
    multiply(x, y) {
        const mod = this.modulus;
        // if (!(0 <= x && x < mod && 0 <= y && y < mod)) {
        //     throw new Error("Inputs out of range");
        // }

        const product = x * y;
        // normal product should be multiplied by r^-1 into Montgomery space, which is a shift operation
        const temp = (product & this.mask) * this.factor & this.mask;
        const reduced = (product + temp * mod) >> BigInt(this.reducerbits);
        const result = reduced < mod ? reduced : reduced - mod;

        // if (!(0 <= result && result < mod)) {
        //     throw new Error("Result out of range");
        // }

        return result;
    }

    /**
     * calculate x^y in montgomery space,     
     * @param {*} x is in Montgomery form and in range [0, modulus)
     * @param {*} y is in standard form
     * @returns in Montgomery form
     */
    pow(x, y) {
        if (!(0 <= x && x < this.modulus)) {
            throw new Error("Input x out of range");
        }

        if (y < 0) {
            throw new Error("Negative exponent");
        }

        let z = this.convertedOne;
       
        while (y != 0) {
            if ((y & 1n) != 0n) {
                z = this.multiply(z, x);
            }

            x = this.multiply(x, x);
            y >>= 1n;
        }

        return z;
    }

    static reciprocalMod(x, mod) {
        // Based on a simplification of the extended Euclidean algorithm
        if (!(mod > 0 && 0 <= x && x < mod)) {
            throw new Error("Inputs out of range");
        }

        let y = x;
        x = mod;
        let a = 0n;
        let b = 1n;

        while (y !== 0n) {
            const tempA = a;
            const tempB = b;

            a = tempB;
            b = tempA - x / y * tempB;

            const tempX = x;
            x = y;
            y = tempX % y;
        }

        if (x === 1n) {
            return a % mod;
        } else {
            throw new Error("Reciprocal does not exist");
        }
    }
}

// Example usage:
const modValue = 561378443618951502299306553130665320725252923637619377544976032679408721032913701974756498493599077821995195515594349132660517770109041456882833476493970342731564208685344318412033829053039175562023259946483190919102290690176213158947926052771336916142256134086286488242422052664493966274085428103301563498493767038384667216578645059793305300742151787289486548960611383143664928478773839449419720310609185226548089573299089077206387473686790387477954621514132267009766513125613356524834466400268725676035463645183947135820248135065635419346778189157106514917221934928544198636113222826214877985831989756813384144831680283988927954056510654530185651714051147656829945293481537113879330238022853005288418804664699394440889591638886402521606880535259553538930764148002590692436874535242766615452312665692928799286936152819628780382203943039911459600883120296221615916999125910966945814675761050809859835257445986770377269016287218258930187341604169489824503561863202260924917671344076088169497196939032376926900132749767365781439698910851409220795275344049214149823323056657543792995790560343364989898000471947352426916084685200209540416778426398828280913128412502891330772931523144347551942784250686468160375496286580107502208188370489n; // Replace with the desired value for 'mod'
const m = new MontgomeryReducer(modValue, 4096);

var microtime = require('microtime');
let start = microtime.now();
a_m = m.convertIn(13693426168854336932690094124679043385580436475506176701131563451349531583715078676045996563251741577319475203118193378172945405129860592086692175820438241953220069952818962728439969321950105767202023362424864437094730216922102619982401612576444043863889206558093740710304136476678915500377035307923843780726664327093678639068094285757766140448530989267445414547829744626463101687941761802304354398610150510265523717426141419933470439469103496581886658427742582350733802033322257243934939012480453297984645115022249787947004025181955648422670279784412433669627317288470672245693695463404423241270563633785356031249067n)
let result_pow_m = m.pow(a_m, 14041856300280849451636326944764877634869690716229394511240479160681238778168714948596794215076974130392199363492941097528999195745563071303692909680618989630970676528255347864609548814875917396288771818083224343247869937215323955952774583197654825959925182684361603453344881983090982970910923973813953134878041289052687559287303533595817893579544065783964566675550227607549043731847009n)
let result_pow = m.convertOut(result_pow_m);
let end = microtime.now();
console.log(`elapsed us: ${end - start}`);
console.log(`result is: ${result_pow}`);
