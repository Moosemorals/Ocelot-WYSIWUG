function $$(a, b) {
    if (b == null) {
        b = a;
        a = document;
    }
    return Array.from(a.querySelectorAll(b));
}

function $(a, b) {
    if (b == null) {
        b = a;
        a = document;
    }
    return a.querySelector(b);
}

function textNode(text) {
    return document.createTextNode(text);
}

function el(name) {
    return document.createElement(name);
}

function clearElement(el) {
    while (el.firstChild != null) {
        el.removeChild(el.firstChild);
    }
}

function buildCommandListener(a) {
    const cmd = a.dataset.command;

    if (cmd === "bold") {
        return () => document.execCommand(cmd, false, null);
    } else if (cmd === "label") {

    }
}

function walkDom(top, fn) {
    top.normalise;
    let queue = [top];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node.nodeType === 1) {
            queue = queue.concat(Array.from(node.childNodes));
        }
        fn(node);
    }
}

function stripWhitespace(el) {
    const whitespaceOnly = /^\s*$/;
    walkDom(el, node => {
        if (node.nodeType === 3 && whitespaceOnly.test(node.nodeValue)) {
            node.parentNode.removeChild(node);
        }
    })
}

function getText(el) {
    let result = "";

    walkDom(el, node => {
        if (node.nodeType === 3) {
            result += node.nodeValue;
        }
    });

    return result;
}

function parseDiv(node) {
    return {
        type: "InstructionStanza",
        text: getText(node)
    }
}

function parseEditorHtml(el) {
    const stanzas = [];
    const children = el.childNodes;

    for (let i = 0; i < children.length; i += 1) {
        const node = children[i];
        if (node.nodeType === 3) {
            // Text node
            stanzas.push({
                type: "InstructionStanza",
                text: node.nodeValue
            });
        } else if (node.nodeType == 1) {
            switch (node.nodeName) {
                case "DIV":
                    stanzas.push(parseDiv(node));
                    break;
            }
        }
    }

    return stanzas;
}

function editorChanged() {
    const preview = $("#preview");
    clearElement(preview);
    const html = $("#editor").innerHTML
    const stanzas = parseEditorHtml($("#editor"));
    preview.appendChild(textNode(html))
    preview.appendChild(el("hr"))
    preview.appendChild(textNode(JSON.stringify(stanzas, null, 2)))
}

function init() {
    // Set defaults
    document.execCommand("defaultParagraphSeparator", false, "<div>")
    document.execCommand("styleWithCSS", false, false)

    // Setup listeners
    $$("a.tool").forEach(a => a.addEventListener("click", buildCommandListener(a)))
    $("#editor").addEventListener("input", editorChanged);

    // Clean whitespace from the default editor
    // blame VSC
    stripWhitespace($("#editor"));

    // Show the default preview
    editorChanged();
}


window.addEventListener("DOMContentLoaded", init);
