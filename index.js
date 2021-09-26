import mapObj from "map-obj";

export const compile = (rule) => {
  let bytecode = "__0__";
  let step = 0;

  mapObj(
    rule,
    (key, val) => {
      if (key === "and" || key === "or" || key === ">" || key === "<") {
        let nextStep = step;
        const arity = calcOperatorArity(key, val);
        bytecode = bytecode.replace(
          `__${step}__`,
          [...Array(arity).keys()]
            .map(
              (idx) =>
                `(${
                  isObject(val[idx])
                    ? `__${++nextStep}__`
                    : JSON.stringify(val[idx])
                })`
            )
            .join(` ${operatorMap[key]} `)
        );
      }

      step += 1;
      return [key, val];
    },
    { deep: true }
  );

  const fn = new Function("data", `return ${bytecode}`);
  fn.bytecode = bytecode;
  return fn;
};

const isObject = (value) => {
  return value != null && typeof value === "object";
};

const operatorMap = {
  or: "||",
  and: "&&",
  ">": ">",
  "<": "<",
};

const calcOperatorArity = (operator = "", value = []) => {
  if (operator === ">" || operator === "<") {
    return 2;
  }
  if (operator === "and" || operator === "or") {
    return value.length;
  }
};
