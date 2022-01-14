class FileInput extends HTMLElement {
    static index = 0;

    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        let name = this.getAttribute("name");
        if(!name) {
            name = "file-input" + FileInput.index;
            FileInput.index++;
        }

        const textContent = this.textContent;
        this.textContent = "";

        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("name", name);
        input.setAttribute("id", name);

        const attributes = [
            "accept",
            "capture",
            "multiple",
            "webkitdirectory"
        ];
        attributes.forEach(attribute => {
            const value = this.getAttribute(attribute);
            if(value) input.setAttribute(attribute, value);
        })

        input.setAttribute("style", `
            width: 0.1px !important;
            height: 0.1px !important;
            opacity: 0.1 !important;
        `);

        const label = document.createElement("label");
        label.setAttribute("for", name);
        label.textContent = textContent;

        this.shadowRoot.appendChild(input);
        this.shadowRoot.appendChild(label);

        for(const key in input) {
            if(key.startsWith("on")) {
                input[key] = e => {
                    try {
                        this.dispatchEvent(new CustomEvent(key.replace(/^on/, "$"), e));
                    } catch (e) {}
                };
            }
        }

        this.addEventListener("$change", event => {
            if(this.valid) {
                this.dispatchEvent(new CustomEvent("$validated", {
                    ...e,
                    valid: this.valid,
                    files: this.files,
                    fileSizes: this.fileSizesString,
                    totalSize: this.fileTotalSizeString
                }));
            }
        });
    }

    get value() {
        return this.shadowRoot.querySelector("input").value;
    }
    get files() {
        return this.shadowRoot.querySelector("input").files;
    }
    get type() {
        return "file";
    }
    get accept() {
        return this.shadowRoot.querySelector("input").accept;
    }
    set accept(accept) {
        this.shadowRoot.querySelector("input").accept = accept;
    }
    get capture() {
        return this.shadowRoot.querySelector("input").capture;
    }
    set capture(capture) {
        this.shadowRoot.querySelector("input").capture = capture;
    }
    get multiple() {
        return this.shadowRoot.querySelector("input").multiple;
    }
    set multiple(multiple) {
        this.shadowRoot.querySelector("input").multiple = multiple;
    }
    get webkitdirectory() {
        return this.shadowRoot.querySelector("input").webkitdirectory;
    }
    set webkitdirectory(webkitdirectory) {
        this.shadowRoot.querySelector("input").webkitdirectory = webkitdirectory;
    }
    get valid() {
        if(this.files.length && !this.accepts) return true;
        if(this.multiple) {
            return !this.files.map(file => this.accepts.includes(file.type)).filter(v => !v).length;
        } else if(this.files.length) {
            return this.accepts.includes(this.files[0].type);
        } else {
            return false;
        }
    }
    get fileSizesString() {
        if(this.files.length) {
            return this.files.map(v => {
                if(v.size < 1024) {
                    return v.size + 'bytes';
                } else if(v.size >= 1024 && v.size < 1048576) {
                    return (v.size / 1024).toFixed(1) + 'KB';
                } else if(v.size >= 1048576) {
                    return (v.size / 1048576).toFixed(1) + 'MB';
                }
            });
        } else {
            return 0;
        }
    }
    get fileTotalSizeString() {
        if(this.files.length) {
            const size = this.files.map(v => v.size).reduce((a, b) => a + b, 0);

            if(size < 1024) {
                return size + 'B';
            } else if(size >= 1024 && size < 1048576) {
                return (size / 1024).toFixed(1) + 'KB';
            } else if(size >= 1048576) {
                return (size / 1048576).toFixed(1) + 'MB';
            }
        } else {
            return 0;
        }
    }
}

customElements.define("file-input", FileInput);

const fileInputs = document.querySelectorAll("file-input");

fileInputs.forEach(e => {
    e.addEventListener("$change", () => console.log(e.valid));
});