export class CarouselManager {
  private static instance: CarouselManager;
  private carousel: HTMLElement | null;
  private prevBtn: HTMLElement | null;
  private nextBtn: HTMLElement | null;
  private indicators: NodeListOf<Element>;
  private currentSlide: number;
  private totalSlides: number;
  private autoAdvanceInterval: number | null;

  private constructor() {
    this.carousel = document.getElementById('carousel');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.indicators = document.querySelectorAll('.carousel-indicator');
    this.currentSlide = 0;
    this.totalSlides = document.querySelectorAll('#carousel > div').length;
    this.autoAdvanceInterval = null;

    if (this.carousel && this.prevBtn && this.nextBtn) {
      this.initializeCarousel();
    }
  }

  public static getInstance(): CarouselManager {
    if (!CarouselManager.instance) {
      CarouselManager.instance = new CarouselManager();
    }
    return CarouselManager.instance;
  }

  private initializeCarousel(): void {
    if (!this.carousel) return;

    // Event listeners
    this.nextBtn?.addEventListener('click', () => this.nextSlide());
    this.prevBtn?.addEventListener('click', () => this.prevSlide());
    
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.currentSlide = index;
        this.updateCarousel();
      });
    });

    // Auto-advance slides every 5 seconds
    this.autoAdvanceInterval = window.setInterval(() => this.nextSlide(), 5000);

    // Initialize carousel
    this.updateCarousel();
  }

  private updateCarousel(): void {
    if (!this.carousel) return;
    
    this.carousel.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
  }

  private nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateCarousel();
  }

  private prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateCarousel();
  }

  public destroy(): void {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
    }
  }
} 