document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenu.classList.contains('hidden');
      if (isExpanded) {
        mobileMenu.classList.remove('hidden');
        // Simple slide animation or fade
        setTimeout(() => {
          mobileMenu.classList.remove('opacity-0', '-translate-y-4');
        }, 10);
      } else {
        mobileMenu.classList.add('opacity-0', '-translate-y-4');
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
        }, 200);
      }
    });
  }

  // 2. Sticky Header and Scroll-to-Top button
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('bg-emerald-deep/95', 'shadow-xl', 'backdrop-blur-md');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('bg-emerald-deep/95', 'shadow-xl', 'backdrop-blur-md');
      header.classList.add('bg-transparent');
    }
  });

  // 3. Highlight Active Page Link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html'))) {
      link.classList.add('text-gold-primary', 'border-b-2', 'border-gold-primary');
      link.classList.remove('text-stone-300', 'hover:text-gold-light');
    }
  });

  // 4. Testimonial Slider (Home page)
  const testimonialContainer = document.getElementById('testimonial-container');
  if (testimonialContainer) {
    const slides = testimonialContainer.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    let currentSlide = 0;

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.add('hidden', 'opacity-0');
        slide.classList.remove('block', 'opacity-100');
      });

      // Handle wrap-around
      if (index >= slides.length) currentSlide = 0;
      else if (index < 0) currentSlide = slides.length - 1;
      else currentSlide = index;

      slides[currentSlide].classList.remove('hidden');
      setTimeout(() => {
        slides[currentSlide].classList.add('block', 'opacity-100');
      }, 50);
    };

    if (prevBtn && nextBtn && slides.length > 0) {
      // Init first slide
      showSlide(0);

      prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
      nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

      // Auto cycle every 6 seconds
      setInterval(() => {
        showSlide(currentSlide + 1);
      }, 6000);
    }
  }

  // 5. Scroll Reveal Animation using Intersection Observer
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          // Once revealed, no need to track anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      // Make sure initial state is set
      el.classList.add('transition-all', 'duration-800', 'ease-out');
      observer.observe(el);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    revealElements.forEach(el => {
      el.classList.remove('opacity-0', 'translate-y-8');
    });
  }

  // 6. Generic Mock Form Submissions with custom Toast Notification
  const forms = document.querySelectorAll('.mock-submit-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Select submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Processing...
        `;
      }

      // Simulate API call
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        // Show toast
        showToast("Success! Your inquiry has been received. Our team will contact you shortly.");
        form.reset();
      }, 1500);
    });
  });

  // Toast container system
  function showToast(message) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-emerald-deep text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-gold-primary/20 pointer-events-auto transform translate-y-10 opacity-0 transition-all duration-300 ease-out';
    toast.innerHTML = `
      <div class="p-1 bg-gold-primary rounded-full text-emerald-deep">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
      </div>
      <div class="flex-1 text-sm font-medium font-sans">${message}</div>
    `;

    toastContainer.appendChild(toast);

    // Slide up
    setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }
});
