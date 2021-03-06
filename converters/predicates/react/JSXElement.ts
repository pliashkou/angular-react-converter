import { ParserPredicate } from "../predicate";
import { isJSXText, JSXText, isJSXElement, JSXElement, JSXIdentifier, JSXAttribute } from "babel-types";
import { resolverRegistry } from "../../../helpers";
import { AbstractComponentCreator } from "../../AbstractComponentCreator";

export class JSXElementPredicate implements ParserPredicate {
    matchingType = "JSXElement";

    isMatching(token:JSXElement):boolean {
        return isJSXElement(token);
    }

    parse(token:JSXElement):any {
        const name = (token.openingElement.name as JSXIdentifier).name;
        const attributes = token.openingElement.attributes.map(x => {
          return this.parseAttribute(x);
        });
    
        const resultNode = AbstractComponentCreator.createRenderNode(
          name,
          [],
          attributes,
          !!token.selfClosing,
        );
        if (token.selfClosing) return resultNode;
        let children = [];
        for (const child of token.children) {
          children.push(resolverRegistry.resolve(child));
        }
        resultNode.children = children;
        return resultNode;
    }

    parseAttribute(attribute: JSXAttribute) {
        switch (attribute.value.type) {
          case 'StringLiteral': {
            return {
              name: attribute.name.name as string,
              value: {
                type: 'StringLiteral',
                value: attribute.value.value
              }
            }
          }
          case 'JSXExpressionContainer': {
              return {
                  name: attribute.name.name,
                  value: attribute.value.expression,
              }
          }
        }
        throw new Error('Unsupported JSXElement attribute type:' + attribute.value.type);
      }
}