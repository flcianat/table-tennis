import Phaser from "phaser";
import * as Colors from "../consts/Colors";

export default class GameBackground extends Phaser.Scene {
  preload() {}

  create() {
    const { width, height } = this.scale;

    // =========================
    // BACKGROUND COLOR
    // =========================
    // Main table color (dark green)
    this.add.rectangle(0, 0, width, height, 0x1a4d2e).setOrigin(0).setDepth(-2);

    // =========================
    // TABLE TEXTURE (wood grain effect)
    // =========================
    const graphics = this.add.graphics();

    // Draw subtle wood grain lines
    graphics.lineStyle(1, 0x2d5a3a, 0.3);

    // Horizontal grain lines
    for (let y = 0; y < height; y += 8) {
      graphics.beginPath();
      graphics.moveTo(0, y);
      graphics.lineTo(width, y + (Math.random() * 4 - 2));
      graphics.strokePath();
    }

    // =========================
    // TABLE BOUNDARIES
    // =========================
    // Outer border (white lines)
    const borderPadding = 20;
    this.add
      .rectangle(
        width / 2,
        height / 2,
        width - borderPadding * 2,
        height - borderPadding * 2,
      )
      .setStrokeStyle(4, Colors.White, 1)
      .setDepth(-1);

    // =========================
    // Center vertical line
    // =========================
    this.add
      .line(
        width / 2,
        height / 2,
        0,
        -height / 2 + borderPadding,
        0,
        height / 2 - borderPadding,
        Colors.White,
        1,
      )
      .setLineWidth(2.5, 2.5)
      .setDepth(-1);

    // =========================
    // Center circle
    // =========================
    this.add
      .circle(width / 2, height / 2, Math.min(width, height) * 0.08)
      .setStrokeStyle(5, Colors.White, 1)
      .setDepth(-1);

    // =========================
    // TABLE CORNERS (rounded effect)
    // =========================
    const cornerGraphics = this.add.graphics();
    cornerGraphics.lineStyle(4, Colors.White, 1);

    // Draw small corner markers (optional)
    const cornerSize = 30;
    const corners = [
      { x: borderPadding, y: borderPadding }, // top-left
      { x: width - borderPadding, y: borderPadding }, // top-right
      { x: borderPadding, y: height - borderPadding }, // bottom-left
      { x: width - borderPadding, y: height - borderPadding }, // bottom-right
    ];

    corners.forEach((corner) => {
      cornerGraphics.beginPath();
      cornerGraphics.moveTo(corner.x - cornerSize / 2, corner.y);
      cornerGraphics.lineTo(corner.x, corner.y);
      cornerGraphics.lineTo(corner.x, corner.y - cornerSize / 2);
      cornerGraphics.strokePath();
    });

    // =========================
    // TABLE SHADOW (for depth)
    // =========================
    this.add
      .rectangle(
        width / 2 + 5,
        height / 2 + 5,
        width - borderPadding * 2,
        height - borderPadding * 2,
      )
      .setFillStyle(0x000000, 0.2)
      .setDepth(-3);

    // =========================
    // NET (simple dashed line effect)
    // =========================
    const netGraphics = this.add.graphics();
    netGraphics.lineStyle(2, Colors.White, 0.6);

    // Draw dashed line for net
    const dashLength = 15;
    const gapLength = 10;
    let y = borderPadding;

    while (y < height - borderPadding) {
      netGraphics.beginPath();
      netGraphics.moveTo(width / 2, y);
      netGraphics.lineTo(
        width / 2,
        Math.min(y + dashLength, height - borderPadding),
      );
      netGraphics.strokePath();
      y += dashLength + gapLength;
    }
  }
}
