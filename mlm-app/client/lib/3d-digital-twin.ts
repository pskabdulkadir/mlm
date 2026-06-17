/**
 * 3D Digital Twin Engine
 * Creates a 3D human model with chakra points and real-time heatmap visualization
 */

import * as THREE from "three";

export interface ChakraPoint {
  name: string;
  position: THREE.Vector3;
  level: number; // 0-100
  blockageLevel: number;
  color: string;
  frequency: number;
}

export class DigitalTwin {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  bodyModel: THREE.Group;
  chakraPoints: Map<string, THREE.Mesh>;
  heatmapTexture: THREE.DataTexture;
  heatmapMaterial: THREE.MeshStandardMaterial;
  animationFrameId: number | null = null;

  // Chakra positions in the body (normalized coordinates)
  private chakraPositions = [
    { name: "Kök Çakrası", pos: new THREE.Vector3(0, -2, 0) },
    { name: "Sakral Çakrası", pos: new THREE.Vector3(0, -1.2, 0) },
    { name: "Güneş Pleksusu", pos: new THREE.Vector3(0, -0.4, 0) },
    { name: "Kalp Çakrası", pos: new THREE.Vector3(0, 0.4, 0) },
    { name: "Boğaz Çakrası", pos: new THREE.Vector3(0, 1.2, 0) },
    { name: "Üçüncü Göz", pos: new THREE.Vector3(0, 1.8, 0.3) },
    { name: "Taç Çakrası", pos: new THREE.Vector3(0, 2.2, 0) }
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Dark blue
    this.scene.fog = new THREE.Fog(0x0f172a, 10, 50);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 3);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    // Lighting
    this.setupLighting();

    // Create body model
    this.bodyModel = new THREE.Group();
    this.scene.add(this.bodyModel);

    // Create heatmap texture
    this.heatmapTexture = this.createHeatmapTexture();

    // Create heatmap material
    this.heatmapMaterial = new THREE.MeshStandardMaterial({
      map: this.heatmapTexture,
      emissiveMap: this.heatmapTexture,
      emissive: new THREE.Color(0x4f46e5),
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.4,
    });

    // Create body geometry
    this.createBodyModel();

    // Chakra points
    this.chakraPoints = new Map();
    this.createChakraPoints();

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xa0a0ff, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point lights for chakras
    const chakraLight = new THREE.PointLight(0x8b5cf6, 0.5, 20);
    chakraLight.position.set(0, 0, 2);
    this.scene.add(chakraLight);
  }

  private createBodyModel(): void {
    // Body: Sphere for torso
    const bodyGeometry = new THREE.CapsuleGeometry(0.8, 2.5, 4, 8);
    const bodyMesh = new THREE.Mesh(bodyGeometry, this.heatmapMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.bodyModel.add(bodyMesh);

    // Head: Sphere
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const headMesh = new THREE.Mesh(headGeometry, this.heatmapMaterial);
    headMesh.position.y = 1.8;
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    this.bodyModel.add(headMesh);

    // Arms: Two cylinders
    const armGeometry = new THREE.CapsuleGeometry(0.2, 1.8, 4, 8);
    
    const leftArm = new THREE.Mesh(armGeometry, this.heatmapMaterial);
    leftArm.position.set(-0.8, 0.3, 0);
    leftArm.rotation.z = Math.PI / 2.5;
    leftArm.castShadow = true;
    this.bodyModel.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, this.heatmapMaterial);
    rightArm.position.set(0.8, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 2.5;
    rightArm.castShadow = true;
    this.bodyModel.add(rightArm);

    // Legs: Two cylinders
    const legGeometry = new THREE.CapsuleGeometry(0.25, 1.8, 4, 8);
    
    const leftLeg = new THREE.Mesh(legGeometry, this.heatmapMaterial);
    leftLeg.position.set(-0.35, -2, 0);
    leftLeg.castShadow = true;
    this.bodyModel.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, this.heatmapMaterial);
    rightLeg.position.set(0.35, -2, 0);
    rightLeg.castShadow = true;
    this.bodyModel.add(rightLeg);

    // Aura glow: Wireframe sphere
    const auraGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const auraMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.2,
    });
    const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
    auraMesh.receiveShadow = true;
    this.bodyModel.add(auraMesh);
  }

  private createChakraPoints(): void {
    this.chakraPositions.forEach((chakra) => {
      // Chakra sphere
      const geometry = new THREE.SphereGeometry(0.25, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0xa855f7,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.3,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(chakra.pos);
      mesh.castShadow = true;
      this.bodyModel.add(mesh);

      this.chakraPoints.set(chakra.name, mesh);

      // Chakra glow ring
      const ringGeometry = new THREE.TorusGeometry(0.4, 0.05, 16, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0xd946ef,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.8,
      });
      
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.position.copy(chakra.pos);
      ringMesh.rotation.x = Math.PI / 4;
      this.bodyModel.add(ringMesh);
    });
  }

  private createHeatmapTexture(): THREE.DataTexture {
    // Create a simple heatmap texture (512x512)
    const width = 512;
    const height = 512;
    const data = new Uint8ClampedArray(width * height * 4);

    // Fill with gradient: blue to purple to red
    for (let i = 0; i < width * height; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      
      // Distance from center
      const dx = x - width / 2;
      const dy = y - height / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalized = Math.min(1, distance / (width / 2));

      // Color gradient
      let r, g, b;
      if (normalized < 0.3) {
        // Blue to purple
        const t = normalized / 0.3;
        r = Math.round(20 + t * 100);
        g = Math.round(100 + t * 50);
        b = Math.round(200 - t * 50);
      } else if (normalized < 0.6) {
        // Purple to red
        const t = (normalized - 0.3) / 0.3;
        r = Math.round(120 + t * 135);
        g = Math.round(150 - t * 100);
        b = Math.round(150 - t * 100);
      } else {
        // Red to orange
        const t = (normalized - 0.6) / 0.4;
        r = Math.round(255);
        g = Math.round(50 + t * 100);
        b = Math.round(50 - t * 40);
      }

      data[i * 4] = r;
      data[i * 4 + 1] = g;
      data[i * 4 + 2] = b;
      data[i * 4 + 3] = 255;
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Update chakra levels and colors based on analysis
   */
  updateChakras(chakras: Array<{ name: string; level: number; blockageLevel: number; frequency: number }>): void {
    chakras.forEach((chakra) => {
      const mesh = this.chakraPoints.get(chakra.name);
      if (!mesh) return;

      // Scale based on level
      const scale = 0.8 + (chakra.level / 100) * 0.5;
      mesh.scale.set(scale, scale, scale);

      // Color based on blockage
      const blockageRatio = chakra.blockageLevel / 100;
      const healthColor = new THREE.Color().lerpColors(
        new THREE.Color(0x10b981), // Green (healthy)
        new THREE.Color(0xef4444), // Red (blocked)
        blockageRatio
      );

      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.copy(healthColor);
        mesh.material.emissive.copy(healthColor);
        mesh.material.emissiveIntensity = 0.6 + blockageRatio * 0.4;
      }
    });
  }

  /**
   * Animate healing process
   */
  animateHealing(duration: number = 5000): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Rotate body
        this.bodyModel.rotation.y = progress * Math.PI * 2;

        // Pulse chakras
        this.chakraPoints.forEach((mesh) => {
          const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.2;
          mesh.scale.multiplyScalar(pulse);
        });

        // Update heatmap intensity
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 0.5 + progress * 0.5;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Render the scene
   */
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Animate continuously
   */
  startAnimation(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      // Gentle rotation
      this.bodyModel.rotation.y += 0.005;

      // Chakra pulsing
      const time = Date.now() * 0.001;
      this.chakraPoints.forEach((mesh, index) => {
        const frequency = 1 + (index * 0.3);
        const pulse = 1 + Math.sin(time * frequency) * 0.15;
        mesh.scale.set(pulse, pulse, pulse);
      });

      this.render();
    };

    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopAnimation();
    this.renderer.dispose();
    this.heatmapTexture.dispose();
    this.heatmapMaterial.dispose();
  }
}

/**
 * Heatmap Overlay for AR visualization
 */
export class HeatmapOverlay {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  data: Map<string, number>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;
    this.data = new Map();
  }

  /**
   * Draw heatmap on canvas
   */
  draw(chakras: Array<{ name: string; level: number; blockageLevel: number }>): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);

    // Draw heatmap circles for each chakra
    chakras.forEach((chakra, index) => {
      // Position along spine
      const y = height * (0.1 + (index / chakras.length) * 0.8);
      const x = width / 2;

      // Radius based on energy level
      const radius = 20 + (chakra.level / 100) * 40;

      // Color gradient
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      if (chakra.blockageLevel > 70) {
        gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)"); // Red
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
      } else if (chakra.blockageLevel > 40) {
        gradient.addColorStop(0, "rgba(251, 146, 60, 0.8)"); // Orange
        gradient.addColorStop(1, "rgba(251, 146, 60, 0)");
      } else {
        gradient.addColorStop(0, "rgba(34, 197, 94, 0.8)"); // Green
        gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
      }

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

      // Border
      this.ctx.strokeStyle = `rgba(168, 85, 247, 0.5)`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    });
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
