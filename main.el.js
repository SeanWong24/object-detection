import { css, html, LitElement } from "https://esm.run/lit@^3";
import { styleMap } from "https://esm.run/lit@^3/directives/style-map.js";
import { createRef, ref } from "https://esm.run/lit@^3/directives/ref.js";
import { detector } from "./detector.util.js";

export class AppMain extends LitElement {
  static styles = css`
    .container {
      margin: 40px auto;
      width: min(90vw, 1400px);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .custom-file-upload {
      display: flex;
      align-items: center;
      cursor: pointer;
      gap: 10px;
      border: 2px solid black;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 6px;
    }

    #file-upload {
      display: none;
    }

    .upload-icon {
      width: 30px;
    }

    #image-container {
      width: 100%;
      margin-top: 20px;
      position: relative;
    }

    #image-container > img {
      width: 100%;
    }

    .bounding-box {
      position: absolute;
      box-sizing: border-box;
      border-width: 2px;
      border-style: solid;
    }

    .bounding-box-label {
      color: white;
      position: absolute;
      font-size: 12px;
      margin-top: -16px;
      margin-left: -2px;
      padding: 1px;
    }

    .analysing-dialog {
      position: fixed;
      margin: 0;
      top: 50vh;
      left: 50vw;
      transform: translate(-50%, -50%);
    }
  `;

  static properties = {
    imageURL: { type: String },
    detectorOutput: { type: Object },
    inputRef: { type: Object },
  };

  constructor() {
    super();
    this.imageURL = "";
    this.detectorOutput;
    this.analysingDialogRef = createRef();
  }

  render() {
    return html`
      <main class="container">
        <label class="custom-file-upload">
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            @change=${this.#fileInputChangeHandler}
          />
          Load image
        </label>
        <div><i>Using ${navigator.gpu ? "GPU" : "CPU"}</i></div>
        <div id="image-container">
          <img src=${this.imageURL} />
          ${this.#renderBoxes()}
        </div>
        <dialog ${ref(this.analysingDialogRef)} class="analysing-dialog">
          Analysing...
        </dialog>
      </main>
    `;
  }

  #fileInputChangeHandler = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    this.#detect((this.imageURL = URL.createObjectURL(file)));
  };

  async #detect(imgSrc) {
    this.analysingDialogRef.value?.showModal();
    this.detectorOutput = await detector(imgSrc, {
      threshold: 0.5,
      percentage: true,
    });
    this.analysingDialogRef.value?.close();
  }

  #renderBoxes() {
    return this.detectorOutput?.map(this.#renderBox);
  }

  #renderBox({ box, label }) {
    const { xmax, xmin, ymax, ymin } = box;
    const color =
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, 0);

    const boxStyles = {
      borderColor: color,
      left: 100 * xmin + "%",
      top: 100 * ymin + "%",
      width: 100 * (xmax - xmin) + "%",
      height: 100 * (ymax - ymin) + "%",
    };
    return html`
      <div class="bounding-box" style=${styleMap(boxStyles)}>
        <span class="bounding-box-label" style="bacground-color: ${color}"
          >${label}</span
        >
      </div>
    `;
  }
}
customElements.define("app-main", AppMain);
