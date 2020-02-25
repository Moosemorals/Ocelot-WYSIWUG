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

function tag(name, options, ...content) {
    const el = document.createElement(name);

    if (typeof options === "string") {
        el.setAttribute("class", options)
    } else if (typeof options === "object") {
        for (let key in options) {
            if (options[key] != null) {
                el.setAttribute(key, options[key]);
            }
        }
    }

    if (content != null) {
        for (let i = 0; i < content.length; i += 1) {
            const s = content[i];
            el.appendChild(textNode(s));
        }
    }
    return el;
}

function clearElement(el) {
    while (el.firstChild != null) {
        el.removeChild(el.firstChild);
    }
}

function insertHtml(node) {
    node.classList.add("stanza");
    $("#editor").appendChild(node);
    updatePreview();
}

function addCallout(type) {
    return () => insertHtml(tag("div", {
        class: "callout " + type,
        contentEditable: "true"
    }));
}

function addInstruction() {
    return () => insertHtml(tag("div", {
        class: "instruction",
        contentEditable: "true"
    }));
}

function bolden() {
    const selection = document.getSelection();

    if (selection.rangeCount === 0) {
        return;
    }
    // Should only be one range
    const range = selection.getRangeAt(0);

    const s = range.extractContents();

    const post = range.startContainer.splitText(range.startOffset)

    const bold = tag("strong");
    bold.appendChild(s);

    range.startContainer.parentNode.insertBefore(bold, post)

    updatePreview();
}

function buildCommandListener(a) {
    const cmd = a.dataset.command;

    switch (cmd) {
        case "bold":
            return bolden;
        case "instruction":
            return addInstruction();
        case "header":
            return addCallout("header")
        case "note":
            return addCallout("note")
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

    el.normalise;

    let queue = [el];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node.nodeType === 3) {
            result += node.nodeValue;
        } else if (node.nodeType === 1) {
            if (node.nodeName === "STRONG") {
                result += "[bold:" + node.firstChild.nodeValue + "]";
            } else {
                queue = queue.concat(Array.from(node.childNodes));
            }
        }
    }
    return result;
}

function handleKeys(e) {
    if (e.target.classList.contains("stanza") && e.keyCode === 13) {
        e.preventDefault();

        const editor = $("#editor");
        const clone = editor.lastElementChild.cloneNode(true);

        clearElement(clone);

        editor.appendChild(clone);
        clone.focus();

        return false;
    }
}

function parseToStanzas(node) {

    const stanzas = [];

    for (let i = 0; i < node.childNodes.length; i += 1) {
        const c = node.childNodes[i];
        if (c.nodeType !== 1 || c.nodeName !== "DIV") {
            continue;
        }

        if (c.classList.contains("instruction")) {
            stanzas.push({
                type: "InstructionStanza",
                text: getText(c)
            })
        } else if (c.classList.contains("note")) {
            stanzas.push({
                type: "CalloutStanza",
                text: getText(c),
                noteType: "note"
            })
        } else if (c.classList.contains("header")) {
            stanzas.push({
                type: "CalloutStanza",
                text: getText(c),
                noteType: "header"
            })
        }
    }
    return stanzas;
}

function updatePreview() {
    const preview = $("#preview");
    clearElement(preview);
    const stanzas = parseToStanzas($("#editor"))
    preview.appendChild(textNode(JSON.stringify(stanzas, null, 2)))

}

function init() {
    // Setup listeners
    document.addEventListener("keypress", handleKeys);
    $$("a.tool").forEach(a => a.addEventListener("click", buildCommandListener(a)))
    $("#editor").addEventListener("input", updatePreview);
}


window.addEventListener("DOMContentLoaded", init);
