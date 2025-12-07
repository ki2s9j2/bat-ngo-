document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('startBtn');
  const intro = document.getElementById('intro');
  const mainContent = document.getElementById('mainContent');
  const lineElement = document.getElementById('line');
  const finalBlock = document.getElementById('final');
  const msgYes = document.getElementById('msgYes');
  const bgMusic = document.getElementById('bgMusic');
  const btnNo = document.getElementById('btnNo');
  
  // Đảm bảo nút startBtn luôn có thể click được
  if (!startButton) {
    console.error('Không tìm thấy nút startBtn!');
  } else {
    // Đảm bảo button có thể click
    startButton.style.pointerEvents = 'auto';
    startButton.style.cursor = 'pointer';
    startButton.style.zIndex = '1001';
  }
  
  // Đếm số lần click nút "Không"
  let noButtonClickCount = 0;
  
  // Kiểm tra mobile và hướng màn hình
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Hàm kiểm tra orientation và ẩn/hiện nội dung (CHỈ cho mobile)
  function checkOrientation() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isDesktop = window.innerWidth > 1024;
    const isLandscape = window.innerWidth > window.innerHeight;
    const rotateRequired = document.getElementById('rotateRequired');
    
    // Desktop: luôn hiển thị nội dung, không cần check orientation
    if (isDesktop) {
      if (rotateRequired) {
        rotateRequired.style.display = 'none';
      }
      // Không cần set display cho intro/mainContent vì CSS đã xử lý qua class .active
      return; // Không cần check tiếp
    }
    
    // Mobile: check orientation
    if (isMobile) {
      if (isLandscape) {
        // Xoay ngang - hiển thị nội dung, ẩn thông báo
        if (rotateRequired) {
          rotateRequired.style.display = 'none';
        }
        // Không cần set display cho intro/mainContent vì CSS đã xử lý qua class .active
      } else {
        // Xoay dọc - ẩn nội dung, hiển thị thông báo
        if (rotateRequired) {
          rotateRequired.style.display = 'flex';
        }
        // CSS media query đã xử lý việc ẩn intro/mainContent
      }
    } else {
      // Không phải mobile - hiển thị bình thường
      if (rotateRequired) {
        rotateRequired.style.display = 'none';
      }
      // Không cần set display cho intro/mainContent vì CSS đã xử lý qua class .active
    }
  }
  
  // Kiểm tra ngay khi load
  checkOrientation();
  
  // Kiểm tra khi resize hoặc orientation change
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(checkOrientation, 150);
  });
  
  window.addEventListener('orientationchange', function() {
    setTimeout(checkOrientation, 200);
  });
  
  // Hàm hiển thị alert dễ thương
  function showCuteAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.className = 'cute-alert';
    alertBox.innerHTML = `
      <div class="cute-alert-content">
        <div class="cute-alert-emoji">💕</div>
        <div class="cute-alert-message">${message}</div>
        <button class="cute-alert-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
      </div>
    `;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.classList.add('show'), 10);
  }
  
  // Không cần showRotateMessage() nữa vì checkOrientation() đã xử lý
  
  // ⚙️ CẤU HÌNH API URL - Thay đổi URL này thành API của bạn
  // Ví dụ: 'https://totinh-api.vercel.app/api/notify'
  // Để trống ('') nếu không muốn dùng API
  const API_URL = ''; // 👈 ĐIỀN API URL CỦA BẠN VÀO ĐÂY
  
  // Hàm gửi thông báo về server API riêng - với retry và timeout
  async function sendNotification(action, eventType = 'click', retries = 2) {
    // Nếu không có API URL, bỏ qua
    if (!API_URL || API_URL.trim() === '') {
      return;
    }
    
    const sendRequest = async (attempt = 0) => {
      try {
        // Tạo AbortController cho timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const response = await fetch(API_URL, {
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
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Notification sent successfully', data);
          return true;
        } else if (response.status === 429) {
          // Rate limited - không retry
          console.warn('⚠️ Rate limited, skipping retry');
          return false;
        } else if (response.status >= 500 && attempt < retries) {
          // Server error - retry
          throw new Error(`Server error: ${response.status}`);
        } else {
          console.warn('⚠️ Failed to send notification:', response.status);
          return false;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Nếu là timeout hoặc network error và còn retry
        if ((error.name === 'AbortError' || error.message.includes('fetch')) && attempt < retries) {
          console.warn(`⚠️ Retry ${attempt + 1}/${retries}...`);
          // Đợi một chút trước khi retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          return sendRequest(attempt + 1);
        }
        
        // Không hiển thị lỗi cho người dùng, chỉ log trong console
        console.warn('⚠️ Notification service unavailable:', error.message);
        return false;
      }
    };
    
    // Chạy async nhưng không block UI
    sendRequest().catch(err => {
      console.warn('Notification error:', err);
    });
  }
  
  // Tạo trái tim bay quanh màn hình
  createFloatingHearts();

  const lines = [
    "Chúng ta đã học chung được 4 năm rồi...",
    "Trong suốt thời gian đó, tớ đã để ý đến cậu rất nhiều.",
    "Mỗi ngày đến lớp, được nhìn thấy cậu là niềm vui của tớ.",
    "Tớ đã giấu cảm xúc này trong lòng khá lâu rồi...",
    "Nhưng hôm nay, tớ muốn thành thật với cậu.",
    "Tớ thích cậu, thật lòng đấy."
  ];

  let currentLine = 0;

  // Hàm xử lý khi click nút Start
  function handleStartClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Kiểm tra intro còn active không
    if (!intro.classList.contains('active')) {
      console.log('Intro đã bị ẩn rồi, không xử lý');
      return;
    }
    
    try {
      const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
      const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);
      
      createHeartParticles(x, y, 15);
      sendNotification('start', 'click');
      
      intro.classList.remove('active');
      mainContent.classList.add('active');
      
      playBackgroundMusic();
      
      setTimeout(() => {
        showLine(lines[currentLine]);
      }, 300);
      
      console.log('✅ Đã click nút Start thành công!');
    } catch (error) {
      console.error('❌ Lỗi khi click nút Start:', error);
    }
  }
  
  // Đảm bảo nút startBtn luôn có thể click được
  if (!startButton) {
    console.error('❌ Không tìm thấy nút startBtn!');
    // Thử tìm lại sau 100ms
    setTimeout(() => {
      const retryBtn = document.getElementById('startBtn');
      if (retryBtn) {
        console.log('✅ Tìm thấy nút startBtn sau khi retry');
        setupStartButton(retryBtn);
      }
    }, 100);
  } else {
    setupStartButton(startButton);
  }
  
  function setupStartButton(btn) {
    // Đảm bảo button có thể click
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '1001';
    btn.style.position = 'relative';
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Bắt đầu');
    
    // Event listener cho click (desktop) - dùng capture để chắc chắn
    btn.addEventListener('click', handleStartClick, { passive: false, capture: true });
    
    // Event listener cho touchstart (mobile)
    btn.addEventListener('touchstart', handleStartClick, { passive: false, capture: true });
    
    // Event listener cho mousedown (backup)
    btn.addEventListener('mousedown', function(e) {
      if (intro.classList.contains('active')) {
        e.preventDefault();
        handleStartClick(e);
      }
    }, { passive: false });
    
    // Event listener cho keydown (keyboard)
    btn.addEventListener('keydown', function(e) {
      if ((e.key === 'Enter' || e.key === ' ') && intro.classList.contains('active')) {
        e.preventDefault();
        handleStartClick(e);
      }
    });
    
    console.log('✅ Nút startBtn đã được setup thành công!', btn);
  }

  function playBackgroundMusic() {
    bgMusic.play().catch((error) => {
      console.error('Lỗi phát nhạc:', error);
    });
  }
  
  // Hàm phát nhạc cho phần trái tim
  function playHeartMusic() {
    const heartMusic = document.getElementById('heartMusic');
    if (heartMusic) {
      // Dừng nhạc nền
      bgMusic.pause();
      bgMusic.currentTime = 0;
      // Phát nhạc trái tim
      heartMusic.play().catch((error) => {
        console.warn('Không thể phát nhạc trái tim (có thể file chưa có):', error);
      });
    } else {
      console.warn('Không tìm thấy element heartMusic');
    }
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
      // Hiển thị canvas khi vào phần yesContent
      const heartCanvas = document.getElementById('heartCanvas');
      const pinkboard = document.getElementById('pinkboard');
      if (heartCanvas) heartCanvas.classList.add('active');
      if (pinkboard) pinkboard.classList.add('active');
      
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
          // Delay 1.5 giây trước khi hiển thị trái tim đỏ
          setTimeout(() => {
            // Khởi động animation trái tim đỏ
            initHeartAnimation();
            // Khởi động animation trái tim hồng (particles bay ra - nhiều lớp)
            initParticleHeart();
            // Phát nhạc cho phần trái tim
            playHeartMusic();
            
            // Sau 1 phút 30 giây (90 giây), hiển thị thông điệp cuối cùng
            setTimeout(() => {
              const finalMessage = document.getElementById('finalMessage');
              if (finalMessage) {
                finalMessage.style.display = 'block';
                finalMessage.style.opacity = '0';
                finalMessage.style.animation = 'fadeInScale 1s ease-out forwards';
              }
            }, 90000); // 90 giây = 1 phút 30 giây
          }, 1500); // Delay 1.5 giây
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

  btnNo.addEventListener('click', () => {
    noButtonClickCount++;
    
    createHeartParticles(
      btnNo.offsetLeft + btnNo.offsetWidth / 2,
      btnNo.offsetTop + btnNo.offsetHeight / 2,
      10
    );
    sendNotification('no', 'click');
    
    if (noButtonClickCount === 1) {
      // Lần 1: Níu kéo - dễ thương hơn
      showCuteAlert('Thôi mà~ 😊<br>Cậu suy nghĩ lại một chút nữa đi mà~<br>Bấm nút "Đồng ý" nhaaa! 💕');
    } else if (noButtonClickCount === 2) {
      // Lần 2: Từ bỏ - dễ thương hơn
      btnNo.style.display = 'none';
      finalBlock.innerHTML = `
        <p style="font-size: 1.5rem; color: #d6336c; margin-bottom: 20px; font-weight: 600;">
          Tớ hiểu rồi... 😔
        </p>
        <p style="font-size: 1.1rem; color: #666; line-height: 1.6;">
          Dù sao cũng cảm ơn cậu đã dành thời gian xem trang này của tớ.<br>
          Chúc cậu luôn hạnh phúc nhé! 💙
        </p>
      `;
    }
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
        scaleMultiplier = newScreenSize * 0.35; // Giảm để vừa màn hình mobile
      } else {
        scaleMultiplier = newScreenSize * 0.3;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', function() {
      setTimeout(() => {
        resizeCanvas();
        // Đảm bảo các nút vẫn có thể bấm được sau khi xoay màn hình
        const finalBlock = document.getElementById('final');
        const buttonGroup = document.querySelector('.button-group');
        if (finalBlock && finalBlock.classList.contains('active')) {
          finalBlock.style.zIndex = '1001';
          finalBlock.style.pointerEvents = 'auto';
        }
        if (buttonGroup) {
          buttonGroup.style.zIndex = '1002';
          buttonGroup.style.pointerEvents = 'auto';
        }
      }, 200); // Tăng delay để đảm bảo resize hoàn tất
    });

    // Giảm traceCount để tối ưu performance
    const traceCount = mobile ? 15 : 25;
    const pointsOrigin = [];
    let i;
    // Tăng dr để ít điểm hơn, đơn giản hơn
    const dr = mobile ? 0.2 : 0.1;
    
    // Scale phù hợp với màn hình - tối ưu cho mobile để nhìn được full
    const screenSize = Math.min(width, height);
    // Giảm scale cho mobile để đảm bảo trái tim vừa màn hình
    let scaleMultiplier = mobile ? screenSize * 0.35 : screenSize * 0.3;

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
        speed: rand() * 0.8 + 1.5, // Giảm speed để trái tim xuất hiện chậm hơn
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
      timeDelta: mobile ? 0.008 : 0.006 // Giảm tốc độ để trái tim xuất hiện chậm hơn
    };

    let time = 0;

    const loop = function () {
      const n = -Math.cos(time);
      pulse((1 + n) * 0.5, (1 + n) * 0.5);
      // Giảm tốc độ để trái tim xuất hiện chậm hơn
      time += ((Math.sin(time)) < 0 ? 4 : (n > 0.8) ? 0.15 : 0.5) * config.timeDelta;

      ctx.fillStyle = "rgba(0,0,0,.08)";
      ctx.fillRect(0, 0, width, height);

      for (i = e.length; i--;) {
        const u = e[i];
        const q = targetPoints[u.q];
        const dx = u.trace[0].x - q[0];
        const dy = u.trace[0].y - q[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        // Tăng ngưỡng để particles ở lại lâu hơn, trái tim xuất hiện lâu hơn
        if (15 > length) { // Tăng từ 12 lên 15
          if (0.95 < rand()) { // Tăng từ 0.93 lên 0.95 để ít thay đổi điểm hơn
            u.q = ~~(rand() * heartPointsCount);
          } else {
            if (0.98 < rand()) { // Tăng từ 0.97 lên 0.98
              u.D *= -1;
            }
            u.q += u.D;
            u.q %= heartPointsCount;
            if (0 > u.q) {
              u.q += heartPointsCount;
            }
          }
        }

        // Giảm tốc độ di chuyển để trái tim xuất hiện chậm hơn
        u.vx += -dx / length * u.speed * 0.7;
        u.vy += -dy / length * u.speed * 0.7;
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

    // Settings - giảm particles để đỡ nhiều
    var settings = {
      particles: {
        length: mobile ? 800 : 1500, // Giảm particles từ 2000-5000 xuống 800-1500
        duration: 2.5,
        velocity: mobile ? 150 : 200,
        effect: -0.6,
        size: mobile ? 11 : 13,
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

      // Nhiều lớp trái tim với kích thước khác nhau
      function pointOnHeart(t) {
        return new Point(
          160 * Math.pow(Math.sin(t), 3),
          130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
        );
      }
      
      function pointOnHeartx(t) {
        return new Point(
          160 * Math.pow(Math.sin(t), 3),
          130 * Math.cos(t) - 20 * Math.cos(2 * t) - 8 * Math.cos(3 * t) - 4 * Math.cos(4 * t) + 5
        );
      }
      
      function pointOnHearty(t) {
        return new Point(
          320 * Math.pow(Math.sin(t), 3),
          260 * Math.cos(t) - 100 * Math.cos(2 * t) - 40 * Math.cos(3 * t) - 4 * Math.cos(4 * t) + 30
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
          point.x = settings.particles.size / 2 + (point.x * settings.particles.size) / 350;
          point.y = settings.particles.size / 2 - (point.y * settings.particles.size) / 350;
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
        // Màu hồng đẹp hơn
        context.fillStyle = '#ff3490';
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

        // Chỉ giữ lại lớp trái tim chính, giảm số lượng để không che trái tim đỏ
        var amount = (particleRate * deltaTime) / 3; // Giảm xuống 1/3 để ít hơn
        for (var i = 0; i < amount; i++) {
          var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
          var dir = pos.clone().length(settings.particles.velocity);
          particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
        }

        // Bỏ 2 lớp phụ (amountx và amounty) để trái tim đỏ hiện rõ hơn

        particles.update(deltaTime);
        particles.draw(context, image);
      }

      function onResize() {
        var heightRatio = 1.5;
        canvas.width = canvas.clientWidth * heightRatio;
        canvas.height = canvas.clientHeight * heightRatio;
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

  // Function đã bỏ - không dùng nữa
  /*
  function initHeartParticlesCenter() {
    const canvas = document.getElementById('heartParticles');
    if (!canvas) return;

    // Settings
    var settings = {
      particles: {
        length: 1500,
        duration: 2.5,
        velocity: 100,
        effect: -1.2,
        size: 12,
      },
    };

    // RequestAnimationFrame polyfill
    (function () {
      var b = 0;
      var c = ["ms", "moz", "webkit", "o"];
      for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
        window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"];
      }
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (h, e) {
          var d = new Date().getTime();
          var f = Math.max(0, 16 - (d - b));
          var g = window.setTimeout(function () {
            h(d + f);
          }, f);
          b = d + f;
          return g;
        };
      }
      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (d) {
          clearTimeout(d);
        };
      }
    })();

    // Point class
    var Point = (function () {
      function Point(x, y) {
        this.x = typeof x !== "undefined" ? x : 0;
        this.y = typeof y !== "undefined" ? y : 0;
      }
      Point.prototype.clone = function () {
        return new Point(this.x, this.y);
      };
      Point.prototype.length = function (length) {
        if (typeof length == "undefined") return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
      };
      Point.prototype.normalize = function () {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
      };
      return Point;
    })();

    // Particle class
    var Particle = (function () {
      function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
      }
      Particle.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
      };
      Particle.prototype.update = function (deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
      };
      Particle.prototype.draw = function (context, image) {
        function ease(t) {
          return --t * t * t + 1;
        }
        var size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
      };
      return Particle;
    })();

    // ParticlePool class
    var ParticlePool = (function () {
      var particles, firstActive = 0, firstFree = 0, duration = settings.particles.duration;
      function ParticlePool(length) {
        particles = new Array(length);
        for (var i = 0; i < particles.length; i++) particles[i] = new Particle();
      }
      ParticlePool.prototype.add = function (x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);
        firstFree++;
        if (firstFree == particles.length) firstFree = 0;
        if (firstActive == firstFree) firstActive++;
        if (firstActive == particles.length) firstActive = 0;
      };
      ParticlePool.prototype.update = function (deltaTime) {
        var i;
        if (firstActive < firstFree) {
          for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime);
        }
        if (firstFree < firstActive) {
          for (i = firstActive; i < particles.length; i++) particles[i].update(deltaTime);
          for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
        }
        while (particles[firstActive].age >= duration && firstActive != firstFree) {
          firstActive++;
          if (firstActive == particles.length) firstActive = 0;
        }
      };
      ParticlePool.prototype.draw = function (context, image) {
        if (firstActive < firstFree) {
          for (i = firstActive; i < firstFree; i++) particles[i].draw(context, image);
        }
        if (firstFree < firstActive) {
          for (i = firstActive; i < particles.length; i++) particles[i].draw(context, image);
          for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
        }
      };
      return ParticlePool;
    })();

    // Main animation
    (function (canvas) {
      var context = canvas.getContext("2d"),
        particles = new ParticlePool(settings.particles.length),
        particleRate = settings.particles.length / settings.particles.duration,
        time;

      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
      const screenSize = Math.min(window.innerWidth, window.innerHeight);
      const heartScale = isMobile ? screenSize * 0.35 : screenSize * 0.3;
      let scaleFactor = heartScale / 160;

      function pointOnHeart(t) {
        return new Point(
          (160 * Math.pow(Math.sin(t), 3)) * scaleFactor,
          (130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25) * scaleFactor
        );
      }

      var image = (function () {
        var canvas = document.createElement("canvas"),
          context = canvas.getContext("2d");
        canvas.width = settings.particles.size;
        canvas.height = settings.particles.size;

        function to(t) {
          var point = pointOnHeart(t);
          point.x = settings.particles.size / 3 + (point.x * settings.particles.size) / (550 * scaleFactor);
          point.y = settings.particles.size / 3 - (point.y * settings.particles.size) / (550 * scaleFactor);
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

        // Màu hồng thay vì xanh cyan
        context.fillStyle = "#ff69b4";
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
          particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
        }
        particles.update(deltaTime);
        particles.draw(context, image);
      }

      function onResize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const newScreenSize = Math.min(canvas.width, canvas.height);
        const newHeartScale = isMobile ? newScreenSize * 0.35 : newScreenSize * 0.3;
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
  */
});
