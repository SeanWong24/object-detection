import { css, html, LitElement } from "https://esm.run/lit@^3";
import { styleMap } from "https://esm.run/lit@^3/directives/style-map.js";
import { detector } from "./detector.util.js";

export class AppMain extends LitElement {
  static styles = css`
    .container {
      margin: 40px auto;
      width: max(50vw, 400px);
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
  `;

  static properties = {
    status: { type: String },
    imageURL: { type: String },
    detectorOutput: { type: Object },
  };

  constructor() {
    super();
    this.status = "";
    this.imageURL = "";
    this.detectorOutput;
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
        <p id="status">${this.status}</p>
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
    this.status = "Analysing...";
    this.detectorOutput = await detector(imgSrc, {
      threshold: 0.5,
      percentage: true,
    });
    this.status = "";
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
