document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('startBtn');
  const intro = document.getElementById('intro');
  const mainContent = document.getElementById('mainContent');
  const lineElement = document.getElementById('line');
  const finalBlock = document.getElementById('final');
  const msgYes = document.getElementById('msgYes');
  const bgMusic = document.getElementById('bgMusic');
  const btnNo = document.getElementById('btnNo');
  
  // Hàm gửi thông báo về server
  async function sendNotification(action, eventType = 'click') {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action, // 'yes', 'no', 'maybe', 'start'
          eventType: eventType, // 'click', 'touchstart', 'hover'
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        })
      });
      
      if (response.ok) {
        console.log('✅ Notification sent successfully');
      } else {
        console.error('❌ Failed to send notification');
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      // Không hiển thị lỗi cho người dùng để tránh làm gián đoạn trải nghiệm
    }
  }
  
  // Tạo trái tim bay quanh màn hình
  createFloatingHearts();

  const lines = [
    "Từ lần đầu gặp cậu, tớ đã biết tim mình không ổn.",
    "Mỗi tin nhắn từ cậu làm tim tớ rung lên từng nhịp.",
    "Tớ đã nghĩ mãi… liệu có nên nói điều này không.",
    "Nhưng nếu không nói thì sẽ tiếc cả đời.",
    "Nên hôm nay, tớ quyết định nói ra...",
    "Tớ thích cậu! 💙"
  ];

  let currentLine = 0;

  startButton.addEventListener('click', (e) => {
    createHeartParticles(e.clientX, e.clientY, 15);
    sendNotification('start', 'click'); // Gửi thông báo khi bắt đầu
    intro.classList.remove('active');
    mainContent.classList.add('active');
    playBackgroundMusic();
    setTimeout(() => {
      showLine(lines[currentLine]);
    }, 300);
  });

  function playBackgroundMusic() {
    bgMusic.play().catch((error) => {
      console.error('Lỗi phát nhạc:', error);
    });
  }

  function showLine(text) {
    lineElement.innerHTML = '';
    let charIndex = 0;
    const p = document.createElement('p');
    p.style.margin = '12px 0';
    p.style.opacity = '0';
    p.style.animation = 'fadeIn 0.3s ease-in forwards';
    lineElement.appendChild(p);

    const typingInterval = setInterval(() => {
      if (charIndex < text.length) {
        const char = text.charAt(charIndex);
        p.innerHTML += char === ' ' ? '&nbsp;' : char;
        charIndex++;
        
        // Tạo trái tim nhỏ khi gõ
        if (charIndex % 5 === 0) {
          createHeartParticles(
            lineElement.offsetLeft + lineElement.offsetWidth / 2,
            lineElement.offsetTop + lineElement.offsetHeight / 2,
            1
          );
        }
      } else {
        clearInterval(typingInterval);
        setTimeout(() => fadeOutCurrentLine(() => {
          currentLine++;
          if (currentLine < lines.length) {
            showLine(lines[currentLine]);
          } else {
            lineElement.style.display = 'none';
            setTimeout(() => {
              finalBlock.classList.add('active');
            }, 300);
          }
        }), 1200);
      }
    }, 60);
  }

  function fadeOutCurrentLine(callback) {
    lineElement.classList.add('fade-out');
    setTimeout(() => {
      lineElement.classList.remove('fade-out');
      lineElement.innerHTML = '';
      callback();
    }, 1000);
  }

  document.getElementById('btnYes').addEventListener('click', (e) => {
    createHeartParticles(e.clientX, e.clientY, 30);
    createConfetti();
    sendNotification('yes', 'click'); // 🎉 Gửi thông báo khi đồng ý
    finalBlock.classList.remove('active');
    
    // Hiển thị phần "Cảm ơn"
    setTimeout(() => {
      msgYes.classList.add('active');
      const thankYouText = document.getElementById('thankYouText');
      const thankYouGif = document.getElementById('thankYouGif');
      const surpriseText = document.getElementById('thankYouText');
      
      // Hiển thị text và GIF
      if (thankYouText) thankYouText.style.display = 'block';
      if (thankYouGif) thankYouGif.style.display = 'block';
      
      // Sau 2 giây, hiện text bất ngờ
      setTimeout(() => {
        const surpriseText = document.getElementById('surpriseText');
        if (surpriseText) {
          surpriseText.style.display = 'block';
          surpriseText.style.opacity = '0';
          surpriseText.style.animation = 'fadeInScale 0.8s ease-out forwards';
          // Tạo nhiều tia sáng xung quanh
          createSparkles();
        }
      }, 2000);
      
      // Sau 4.5 giây, ẩn tất cả và chạy animation trái tim
      setTimeout(() => {
        const surpriseContent = document.getElementById('surpriseContent');
        if (thankYouText) {
          thankYouText.style.opacity = '0';
          thankYouText.style.transition = 'opacity 0.8s ease-out';
        }
        if (thankYouGif) {
          thankYouGif.style.opacity = '0';
          thankYouGif.style.transition = 'opacity 0.8s ease-out';
        }
        const surpriseText = document.getElementById('surpriseText');
        if (surpriseText) {
          surpriseText.style.opacity = '0';
          surpriseText.style.transition = 'opacity 0.8s ease-out';
        }
        
        // Sau khi fade out xong, ẩn hoàn toàn và chạy animation
        setTimeout(() => {
          if (surpriseContent) surpriseContent.style.display = 'none';
          // Khởi động animation trái tim lý tưởng với tia sáng
          initHeartAnimation();
          // Khởi động animation particles bay ra từ trái tim
          initParticleHeart();
        }, 800);
      }, 4500);
    }, 300);
    
    bgMusic.pause();
    bgMusic.currentTime = 0;
    
    // Tạo nhiều trái tim bay lên
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        createHeartParticles(
          Math.random() * window.innerWidth,
          window.innerHeight + 50,
          1
        );
      }, i * 50);
    }
  });

  // Phát hiện khi người dùng chuẩn bị click "Không" (cho cả desktop và mobile)
  btnNo.addEventListener('mouseover', () => {
    sendNotification('no', 'hover'); // Gửi thông báo khi hover (desktop)
    const maxX = window.innerWidth - btnNo.offsetWidth;
    const maxY = window.innerHeight - btnNo.offsetHeight;
    btnNo.style.position = 'fixed';
    btnNo.style.left = `${Math.random() * maxX}px`;
    btnNo.style.top = `${Math.random() * maxY}px`;
  });

  // Phát hiện khi người dùng chạm vào nút "Không" trên mobile (trước khi click)
  btnNo.addEventListener('touchstart', (e) => {
    sendNotification('no', 'touchstart'); // Gửi thông báo khi touch (mobile)
  }, { passive: true });

  // Phát hiện khi người dùng di chuyển chuột gần nút "Không"
  btnNo.addEventListener('mouseenter', () => {
    sendNotification('no', 'mouseenter');
  });

  btnNo.addEventListener('click', () => {
    createHeartParticles(
      btnNo.offsetLeft + btnNo.offsetWidth / 2,
      btnNo.offsetTop + btnNo.offsetHeight / 2,
      10
    );
    sendNotification('no', 'click'); // Gửi thông báo khi click
    alert('Thôi mà, bấm lại nút "Đồng ý" nhaaa~');
  });
  
  // Tạo trái tim bay quanh màn hình
  function createFloatingHearts() {
    const hearts = ['💕', '💖', '💗', '💓', '💝', '💞', '💟'];
    const container = document.createElement('div');
    container.className = 'floating-hearts';
    document.body.appendChild(container);
    
    for (let i = 0; i < 20; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = Math.random() * 100 + '%';
      heart.style.top = Math.random() * 100 + '%';
      heart.style.animationDelay = Math.random() * 5 + 's';
      heart.style.fontSize = (20 + Math.random() * 20) + 'px';
      heart.style.opacity = 0.5 + Math.random() * 0.3;
      container.appendChild(heart);
    }
  }
  
  // Tạo trái tim khi click
  function createHeartParticles(x, y, count = 5) {
    const hearts = ['💕', '💖', '💗', '💓', '💝', '💞', '💟'];
    
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      
      const offsetX = (Math.random() - 0.5) * 150;
      const offsetY = (Math.random() - 0.5) * 100;
      heart.style.left = (x + offsetX) + 'px';
      heart.style.top = (y + offsetY) + 'px';
      heart.style.fontSize = (20 + Math.random() * 15) + 'px';
      
      document.body.appendChild(heart);
      
      setTimeout(() => {
        heart.remove();
      }, 3000);
    }
  }
  
  // Tạo confetti khi đồng ý
  function createConfetti() {
    const colors = ['#ff6b9d', '#c44569', '#ff1493', '#ff69b4', '#ff99aa'];
    
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (5 + Math.random() * 10) + 'px';
        confetti.style.height = (5 + Math.random() * 10) + 'px';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.remove();
        }, 4000);
      }, i * 20);
    }
  }

  // Tạo tia sáng (sparkles) xung quanh
  function createSparkles() {
    const sparkleContainer = document.createElement('div');
    sparkleContainer.style.position = 'fixed';
    sparkleContainer.style.top = '0';
    sparkleContainer.style.left = '0';
    sparkleContainer.style.width = '100%';
    sparkleContainer.style.height = '100%';
    sparkleContainer.style.pointerEvents = 'none';
    sparkleContainer.style.zIndex = '1000';
    document.body.appendChild(sparkleContainer);

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#fff';
        sparkle.style.borderRadius = '50%';
        sparkle.style.boxShadow = '0 0 10px #ff1493, 0 0 20px #ff69b4, 0 0 30px #ff1493';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animation = 'sparkleFloat 3s ease-in-out infinite';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparkleContainer.appendChild(sparkle);
      }, i * 100);
    }

    setTimeout(() => {
      sparkleContainer.remove();
    }, 5000);
  }

  // Animation trái tim lý tưởng
  function initHeartAnimation() {
    const canvas = document.getElementById('heartCanvas');
    if (!canvas) return;

    // Polyfill cho requestAnimationFrame
    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      (function () {
        return function (callback, element) {
          var lastTime = element.__lastTime;
          if (lastTime === undefined) {
            lastTime = 0;
          }
          var currTime = Date.now();
          var timeToCall = Math.max(1, 33 - (currTime - lastTime));
          window.setTimeout(callback, timeToCall);
          element.__lastTime = currTime + timeToCall;
        };
      })();

    const isDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
    );

    const mobile = isDevice;
    // Sửa để full màn hình trên mobile
    const ctx = canvas.getContext('2d');
    let width = canvas.width = innerWidth;
    let height = canvas.height = innerHeight;
    const rand = Math.random;

    // Background trong suốt hơn
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, width, height);

    const heartPosition = function (rad) {
      return [
        Math.pow(Math.sin(rad), 3),
        -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
      ];
    };

    const scaleAndTranslate = function (pos, sx, sy, dx, dy) {
      return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    // Hàm resize canvas
    const resizeCanvas = function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, width, height);
      // Cập nhật lại scale multiplier khi resize
      const newScreenSize = Math.min(width, height);
      if (mobile) {
        scaleMultiplier = newScreenSize * 0.4;
      } else {
        scaleMultiplier = newScreenSize * 0.3;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', function() {
      setTimeout(resizeCanvas, 100); // Delay để đợi orientation change hoàn tất
    });

    // Giảm traceCount để tối ưu performance
    const traceCount = mobile ? 15 : 25;
    const pointsOrigin = [];
    let i;
    // Tăng dr để ít điểm hơn, đơn giản hơn
    const dr = mobile ? 0.2 : 0.1;
    
    // Scale phù hợp với màn hình
    const screenSize = Math.min(width, height);
    let scaleMultiplier = mobile ? screenSize * 0.4 : screenSize * 0.3;

    // Chỉ tạo 2-3 lớp đơn giản
    // Lớp ngoài cùng
    for (i = 0; i < Math.PI * 2; i += dr) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), scaleMultiplier, scaleMultiplier * 0.06, 0, 0));
    }
    // Lớp giữa
    for (i = 0; i < Math.PI * 2; i += dr) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), scaleMultiplier * 0.7, scaleMultiplier * 0.04, 0, 0));
    }
    // Lớp trong (chỉ desktop)
    if (!mobile) {
      for (i = 0; i < Math.PI * 2; i += dr) {
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), scaleMultiplier * 0.4, scaleMultiplier * 0.025, 0, 0));
      }
    }

    const heartPointsCount = pointsOrigin.length;
    const targetPoints = [];

    const pulse = function (kx, ky) {
      for (i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [];
        targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
        targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
      }
    };

    // Giảm số lượng particles đáng kể để tối ưu performance
    // Mỗi điểm chỉ có 1 particle (đơn giản)
    const totalParticles = mobile ? Math.min(heartPointsCount, 60) : Math.min(heartPointsCount, 100);
    
    const e = [];
    for (i = 0; i < totalParticles; i++) {
      const x = rand() * width;
      const y = rand() * height;
      e[i] = {
        vx: 0,
        vy: 0,
        R: 2,
        speed: rand() * 1.5 + 3.5,
        q: ~~(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.7,
        f: "hsla(" + ~~(rand() * 20) + "," + ~~(50 * rand() + 50) + "%," + ~~(50 * rand() + 30) + "%,.6)",
        trace: [],
        size: mobile ? 1.2 : 1.5
      };
      for (var k = 0; k < traceCount; k++) {
        e[i].trace[k] = { x: x, y: y };
      }
    }

    const config = {
      traceK: 0.4,
      timeDelta: mobile ? 0.015 : 0.01 // Nhanh hơn một chút để mượt hơn
    };

    let time = 0;

    // Tạo tia sáng xung quanh trái tim (ít hơn trên mobile)
    const rays = [];
    const rayCount = mobile ? 8 : 12;
    for (let r = 0; r < rayCount; r++) {
      rays.push({
        angle: (r * Math.PI * 2) / rayCount,
        length: mobile ? 60 : 100,
        speed: mobile ? 0.015 : 0.02
      });
    }

    const loop = function () {
      const n = -Math.cos(time);
      pulse((1 + n) * 0.5, (1 + n) * 0.5);
      time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? 0.2 : 1) * config.timeDelta;

      ctx.fillStyle = "rgba(0,0,0,.08)";
      ctx.fillRect(0, 0, width, height);
      
      // Vẽ tia sáng xung quanh trái tim (đơn giản hơn)
      ctx.save();
      ctx.translate(width / 2, height / 2);
      const rayBaseLength = mobile ? screenSize * 0.2 : screenSize * 0.15;
      for (let r = 0; r < rays.length; r++) {
        const ray = rays[r];
        ray.angle += ray.speed;
        const x1 = Math.cos(ray.angle) * rayBaseLength;
        const y1 = Math.sin(ray.angle) * rayBaseLength;
        const x2 = Math.cos(ray.angle) * (rayBaseLength + ray.length);
        const y2 = Math.sin(ray.angle) * (rayBaseLength + ray.length);
        
        ctx.strokeStyle = mobile ? 'rgba(255, 20, 147, 0.5)' : 'rgba(255, 20, 147, 0.6)';
        ctx.lineWidth = mobile ? 2 : 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      for (i = e.length; i--;) {
        const u = e[i];
        const q = targetPoints[u.q];
        const dx = u.trace[0].x - q[0];
        const dy = u.trace[0].y - q[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        // Ngưỡng hợp lý để particles tạo thành hình trái tim
        if (12 > length) {
          if (0.93 < rand()) {
            u.q = ~~(rand() * heartPointsCount);
          } else {
            if (0.97 < rand()) {
              u.D *= -1;
            }
            u.q += u.D;
            u.q %= heartPointsCount;
            if (0 > u.q) {
              u.q += heartPointsCount;
            }
          }
        }

        u.vx += -dx / length * u.speed;
        u.vy += -dy / length * u.speed;
        u.trace[0].x += u.vx;
        u.trace[0].y += u.vy;
        u.vx *= u.force;
        u.vy *= u.force;

        for (var k = 0; k < u.trace.length - 1;) {
          const T = u.trace[k];
          const N = u.trace[++k];
          N.x -= config.traceK * (N.x - T.x);
          N.y -= config.traceK * (N.y - T.y);
        }

        // Vẽ particles đơn giản hơn để tối ưu performance
        ctx.fillStyle = u.f;
        for (k = 0; k < u.trace.length; k++) {
          const tracePoint = u.trace[k];
          // Đơn giản hóa: chỉ vẽ điểm, không dùng arc
          ctx.fillRect(tracePoint.x, tracePoint.y, u.size, u.size);
        }
      }

      window.requestAnimationFrame(loop, canvas);
    };

    loop();
  }

  // Animation particles bay ra từ trái tim
  function initParticleHeart() {
    const canvas = document.getElementById('pinkboard');
    if (!canvas) return;

    const isDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
    );
    const mobile = isDevice;

    // RequestAnimationFrame polyfill
    (function() {
      var b = 0;
      var c = ["ms", "moz", "webkit", "o"];
      for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
        window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"];
      }
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(h, e) {
          var d = new Date().getTime();
          var f = Math.max(0, 16 - (d - b));
          var g = window.setTimeout(function() {
            h(d + f);
          }, f);
          b = d + f;
          return g;
        };
      }
      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(d) {
          clearTimeout(d);
        };
      }
    })();

    // Settings - tối ưu cho mobile
    var settings = {
      particles: {
        length: mobile ? 500 : 1000, // Giảm particles cho mobile
        duration: 2,
        velocity: mobile ? 100 : 135,
        effect: -0.35,
        size: mobile ? 10 : 14,
      },
    };

    // Point class
    var Point = (function() {
      function Point(x, y) {
        this.x = (typeof x !== 'undefined') ? x : 0;
        this.y = (typeof y !== 'undefined') ? y : 0;
      }
      Point.prototype.clone = function() {
        return new Point(this.x, this.y);
      };
      Point.prototype.length = function(length) {
        if (typeof length == 'undefined')
          return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
      };
      Point.prototype.normalize = function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
      };
      return Point;
    })();

    // Particle class
    var Particle = (function() {
      function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
      }
      Particle.prototype.initialize = function(x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
      };
      Particle.prototype.update = function(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
      };
      Particle.prototype.draw = function(context, image) {
        function ease(t) {
          return (--t) * t * t + 1;
        }
        var size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
      };
      return Particle;
    })();

    // ParticlePool class
    var ParticlePool = (function() {
      var particles,
        firstActive = 0,
        firstFree = 0,
        duration = settings.particles.duration;

      function ParticlePool(length) {
        particles = new Array(length);
        for (var i = 0; i < particles.length; i++)
          particles[i] = new Particle();
      }

      ParticlePool.prototype.add = function(x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);
        firstFree++;
        if (firstFree == particles.length) firstFree = 0;
        if (firstActive == firstFree) firstActive++;
        if (firstActive == particles.length) firstActive = 0;
      };

      ParticlePool.prototype.update = function(deltaTime) {
        var i;
        if (firstActive < firstFree) {
          for (i = firstActive; i < firstFree; i++)
            particles[i].update(deltaTime);
        }
        if (firstFree < firstActive) {
          for (i = firstActive; i < particles.length; i++)
            particles[i].update(deltaTime);
          for (i = 0; i < firstFree; i++)
            particles[i].update(deltaTime);
        }
        while (particles[firstActive].age >= duration && firstActive != firstFree) {
          firstActive++;
          if (firstActive == particles.length) firstActive = 0;
        }
      };

      ParticlePool.prototype.draw = function(context, image) {
        var i;
        if (firstActive < firstFree) {
          for (i = firstActive; i < firstFree; i++)
            particles[i].draw(context, image);
        }
        if (firstFree < firstActive) {
          for (i = firstActive; i < particles.length; i++)
            particles[i].draw(context, image);
          for (i = 0; i < firstFree; i++)
            particles[i].draw(context, image);
        }
      };

      return ParticlePool;
    })();

    // Main animation
    (function(canvas) {
      var context = canvas.getContext('2d'),
        particles = new ParticlePool(settings.particles.length),
        particleRate = settings.particles.length / settings.particles.duration,
        time;

      // Điều chỉnh scale để khớp với trái tim animation
      const screenSize = Math.min(canvas.width, canvas.height);
      const heartScale = mobile ? screenSize * 0.4 : screenSize * 0.3;
      let scaleFactor = heartScale / 160; // Scale factor để khớp với trái tim

      function pointOnHeart(t) {
        return new Point(
          (160 * Math.pow(Math.sin(t), 3)) * scaleFactor,
          (130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25) * scaleFactor
        );
      }

      // Creating particle image
      var image = (function() {
        var canvas = document.createElement('canvas'),
          context = canvas.getContext('2d');
        canvas.width = settings.particles.size;
        canvas.height = settings.particles.size;

        function to(t) {
          var point = pointOnHeart(t);
          // Điều chỉnh để particles nhỏ hơn và khớp với trái tim
          point.x = settings.particles.size / 3 + point.x * settings.particles.size / (550 * scaleFactor);
          point.y = settings.particles.size / 3 - point.y * settings.particles.size / (550 * scaleFactor);
          return point;
        }

        context.beginPath();
        var t = -Math.PI;
        var point = to(t);
        context.moveTo(point.x, point.y);
        while (t < Math.PI) {
          t += 0.01;
          point = to(t);
          context.lineTo(point.x, point.y);
        }
        context.closePath();
        context.fillStyle = '#ea80b0';
        context.fill();

        var image = new Image();
        image.src = canvas.toDataURL();
        return image;
      })();

      function render() {
        requestAnimationFrame(render);

        var newTime = new Date().getTime() / 1000,
          deltaTime = newTime - (time || newTime);
        time = newTime;

        context.clearRect(0, 0, canvas.width, canvas.height);

        var amount = particleRate * deltaTime;
        for (var i = 0; i < amount; i++) {
          var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
          var dir = pos.clone().length(settings.particles.velocity);
          // Đảm bảo particles bay ra từ đúng tâm trái tim
          particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
        }

        particles.update(deltaTime);
        particles.draw(context, image);
      }

      function onResize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        // Cập nhật lại scale khi resize
        const newScreenSize = Math.min(canvas.width, canvas.height);
        const newHeartScale = mobile ? newScreenSize * 0.4 : newScreenSize * 0.3;
        scaleFactor = newHeartScale / 160;
      }

      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', function() {
        setTimeout(onResize, 100);
      });

      setTimeout(function() {
        onResize();
        render();
      }, 10);
    })(canvas);
  }
});
