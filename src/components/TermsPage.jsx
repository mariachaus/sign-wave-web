import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/pages/TermsPage.scss';

const TermsPage = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isUk = i18n.language === 'uk';

  const sections = isUk ? [
    {
      id: 'acceptance',
      title: '1. Прийняття умов',
      content: (
        <>
          <p>Ці Умови використання («Умови») регулюють ваш доступ до освітньої платформи SignWave та її використання. Будь ласка, уважно ознайомтеся з ними перед реєстрацією.</p>
          <p>Натискаючи кнопку «Зареєструватися» або використовуючи будь-яку функцію платформи, ви підтверджуєте, що прочитали, зрозуміли та погоджуєтесь дотримуватись цих Умов. Якщо ви не погоджуєтесь з будь-яким положенням, будь ласка, не використовуйте платформу.</p>
          <p>SignWave залишає за собою право оновлювати ці Умови. Про суттєві зміни ми повідомлятимемо через email або відповідне повідомлення у додатку. Продовження використання після змін означає їх прийняття.</p>
        </>
      ),
    },
    {
      id: 'definitions',
      title: '2. Визначення термінів',
      content: (
        <ul>
          <li><strong>«Платформа»</strong> — веб-додаток SignWave, доступний за відповідною адресою, включаючи всі його функції та контент.</li>
          <li><strong>«Користувач»</strong> — будь-яка фізична особа, яка зареєстрована на платформі та використовує її функції.</li>
          <li><strong>«Контент»</strong> — навчальні матеріали, відео, зображення, тексти, жести та будь-які інші матеріали, розміщені на платформі.</li>
          <li><strong>«Обліковий запис»</strong> — персональний профіль користувача, створений у результаті реєстрації.</li>
          <li><strong>«УЖМ»</strong> — Українська жестова мова, вивченню якої присвячена платформа.</li>
          <li><strong>«Персональні дані»</strong> — будь-яка інформація, що дозволяє ідентифікувати особу користувача.</li>
        </ul>
      ),
    },
    {
      id: 'accounts',
      title: '3. Реєстрація та обліковий запис',
      content: (
        <>
          <p>Для отримання повного доступу до функцій платформи необхідна реєстрація. Реєструючись, ви гарантуєте, що:</p>
          <ul>
            <li>вам виповнилось щонайменше 13 років (або ви отримали згоду від батьків/опікунів, якщо ви молодше);</li>
            <li>надана вами інформація є точною, актуальною та повною;</li>
            <li>ви будете підтримувати актуальність свого профілю;</li>
            <li>ви не будете передавати доступ до свого облікового запису третім особам.</li>
          </ul>
          <p>Ви несете повну відповідальність за всі дії, що відбуваються під вашим обліковим записом. У разі підозри на несанкціонований доступ — негайно повідомте нас та змініть пароль.</p>
          <p>SignWave залишає за собою право призупинити або видалити обліковий запис, якщо є підстави вважати, що надана інформація є недостовірною або порушуються ці Умови.</p>
        </>
      ),
    },
    {
      id: 'camera',
      title: '4. Використання камери та обробка зображень',
      content: (
        <>
          <p>Деякі функції SignWave (вправи з розпізнавання жестів, практика) можуть вимагати доступу до вашої веб-камери. Щодо обробки відеоданих:</p>
          <ul>
            <li><strong>Локальна обробка.</strong> Розпізнавання жестів здійснюється безпосередньо у вашому браузері за допомогою технології MediaPipe. Відеодані з камери не записуються, не зберігаються та не передаються на наші сервери.</li>
            <li><strong>Дозвіл на камеру.</strong> Браузер запитає ваш дозвіл перед активацією камери. Ви можете відкликати доступ у будь-який момент через налаштування браузера.</li>
            <li><strong>Відсутність запису.</strong> SignWave не веде запис відеопотоку з вашої камери ні за яких обставин.</li>
            <li><strong>Лише для навчання.</strong> Доступ до камери використовується виключно для надання функцій навчання — перевірки правильності виконання жестів у реальному часі.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'privacy',
      title: '5. Конфіденційність та захист даних',
      content: (
        <>
          <p>Ми збираємо та обробляємо лише ті персональні дані, які необхідні для роботи платформи:</p>
          <ul>
            <li><strong>Дані облікового запису:</strong> ім'я користувача, адреса електронної пошти, захищений хеш пароля.</li>
            <li><strong>Навчальний прогрес:</strong> результати уроків, досягнення, серії активності (streak), статистика вивчених жестів.</li>
            <li><strong>Налаштування:</strong> мовні та інтерфейсні уподобання, параметри відображення.</li>
            <li><strong>Аватар:</strong> зображення профілю, якщо ви його завантажили (зберігається в захищеному хмарному сховищі Cloudinary).</li>
          </ul>
          <p>Ваші персональні дані <strong>не продаються</strong> та <strong>не передаються</strong> третім особам у комерційних цілях. Дані можуть бути розкриті лише у разі, якщо це вимагається чинним законодавством України.</p>
          <p>Ви маєте право в будь-який час запросити повне видалення вашого облікового запису та пов'язаних даних через розділ «Налаштування → Особиста інформація → Видалити акаунт».</p>
        </>
      ),
    },
    {
      id: 'ip',
      title: '6. Інтелектуальна власність',
      content: (
        <>
          <p>Весь контент платформи SignWave, включаючи навчальні матеріали, відеозаписи жестів, зображення, тексти, логотипи та програмне забезпечення, є інтелектуальною власністю SignWave або його ліцензіарів та захищений законодавством України про авторське право.</p>
          <p>Вам надається обмежена, невиключна, непередавана ліцензія на особисте некомерційне використання платформи та її контенту виключно в освітніх цілях.</p>
          <p>Забороняється копіювати, відтворювати, поширювати, продавати або будь-яким іншим чином використовувати контент платформи без письмового дозволу SignWave.</p>
        </>
      ),
    },
    {
      id: 'prohibited',
      title: '7. Заборонені дії',
      content: (
        <>
          <p>Під час використання платформи забороняється:</p>
          <ul>
            <li>намагатись отримати несанкціонований доступ до платформи, її серверів або баз даних;</li>
            <li>використовувати автоматизовані засоби (боти, скрипти) для взаємодії з платформою без дозволу;</li>
            <li>завантажувати, поширювати або публікувати контент, що порушує права третіх осіб;</li>
            <li>займатися будь-якою діяльністю, що може пошкодити роботу платформи або завдати шкоди іншим користувачам;</li>
            <li>використовувати платформу в комерційних цілях без письмового дозволу SignWave;</li>
            <li>видавати себе за іншу особу або надавати свідомо хибну інформацію.</li>
          </ul>
          <p>Порушення цих заборон може призвести до негайного призупинення або видалення вашого облікового запису.</p>
        </>
      ),
    },
    {
      id: 'disclaimer',
      title: '8. Відмова від гарантій',
      content: (
        <>
          <p>Платформа SignWave надається «як є» та «як доступна» без будь-яких гарантій. Ми докладаємо всіх зусиль для забезпечення точності навчального контенту, проте <strong>не гарантуємо</strong>:</p>
          <ul>
            <li>повну точність відображення жестів УЖМ для офіційного, медичного або юридичного використання;</li>
            <li>безперебійну роботу платформи 24/7;</li>
            <li>сумісність з усіма пристроями та браузерами;</li>
            <li>що точність розпізнавання жестів алгоритмом відповідатиме рівню живого перекладача.</li>
          </ul>
          <p>Для відповідального спілкування з людьми з порушеннями слуху в офіційних або критично важливих ситуаціях завжди звертайтесь до сертифікованого перекладача УЖМ.</p>
        </>
      ),
    },
    {
      id: 'liability',
      title: '9. Обмеження відповідальності',
      content: (
        <p>У межах, дозволених чинним законодавством України, SignWave не несе відповідальності за будь-які прямі, непрямі, випадкові або наслідкові збитки, що виникли в результаті використання або неможливості використання платформи, включаючи втрату даних або переривання навчального процесу.</p>
      ),
    },
    {
      id: 'termination',
      title: '10. Призупинення та видалення',
      content: (
        <>
          <p>Ви можете в будь-який час видалити свій обліковий запис через розділ «Налаштування». Після видалення всі ваші персональні дані будуть видалені з наших систем протягом 30 днів.</p>
          <p>SignWave залишає за собою право призупинити або видалити обліковий запис без попередження у разі порушення цих Умов або за рішенням суду.</p>
        </>
      ),
    },
    {
      id: 'law',
      title: '11. Застосовне право',
      content: (
        <p>Ці Умови регулюються та тлумачаться відповідно до законодавства України. Будь-які спори, що виникають у зв'язку з цими Умовами, підлягають вирішенню у судах України за місцем знаходження SignWave.</p>
      ),
    },
    {
      id: 'contact',
      title: '12. Контактна інформація',
      content: (
        <>
          <p>З питань щодо цих Умов або конфіденційності ви можете звернутись до нас:</p>
          <ul>
            <li><strong>Email:</strong> support@signwave.app</li>
            <li><strong>Платформа:</strong> SignWave</li>
          </ul>
          <p>Ми намагаємось відповідати на всі звернення протягом 5 робочих днів.</p>
        </>
      ),
    },
  ] : [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <>
          <p>These Terms of Use ("Terms") govern your access to and use of the SignWave educational platform. Please read them carefully before registering.</p>
          <p>By clicking "Register" or using any feature of the platform, you confirm that you have read, understood, and agree to be bound by these Terms. If you disagree with any provision, please do not use the platform.</p>
          <p>SignWave reserves the right to update these Terms. We will notify you of significant changes via email or an in-app notice. Continued use after changes constitutes acceptance.</p>
        </>
      ),
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      content: (
        <ul>
          <li><strong>"Platform"</strong> — the SignWave web application, including all its features and content.</li>
          <li><strong>"User"</strong> — any individual who has registered on and uses the platform.</li>
          <li><strong>"Content"</strong> — educational materials, videos, images, texts, gestures, and any other materials hosted on the platform.</li>
          <li><strong>"Account"</strong> — a personal profile created upon registration.</li>
          <li><strong>"USL"</strong> — Ukrainian Sign Language, which the platform is dedicated to teaching.</li>
          <li><strong>"Personal Data"</strong> — any information that allows the identification of a user.</li>
        </ul>
      ),
    },
    {
      id: 'accounts',
      title: '3. Registration and Account',
      content: (
        <>
          <p>Registration is required to access the full features of the platform. By registering, you warrant that:</p>
          <ul>
            <li>you are at least 13 years old (or have parental/guardian consent if younger);</li>
            <li>the information you provide is accurate, current, and complete;</li>
            <li>you will keep your profile up to date;</li>
            <li>you will not share access to your account with third parties.</li>
          </ul>
          <p>You are fully responsible for all activities that occur under your account. If you suspect unauthorized access, immediately notify us and change your password.</p>
          <p>SignWave reserves the right to suspend or delete an account if there is reason to believe that provided information is false or these Terms are being violated.</p>
        </>
      ),
    },
    {
      id: 'camera',
      title: '4. Camera Use and Image Processing',
      content: (
        <>
          <p>Some SignWave features (gesture recognition exercises, practice sessions) may require access to your webcam. Regarding video data processing:</p>
          <ul>
            <li><strong>Local processing.</strong> Gesture recognition is performed directly in your browser using MediaPipe technology. Camera video data is not recorded, stored, or transmitted to our servers.</li>
            <li><strong>Camera permission.</strong> Your browser will request your permission before activating the camera. You can revoke access at any time through your browser settings.</li>
            <li><strong>No recording.</strong> SignWave does not record your video stream under any circumstances.</li>
            <li><strong>Educational use only.</strong> Camera access is used exclusively to provide learning features — real-time gesture correctness checking.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'privacy',
      title: '5. Privacy and Data Protection',
      content: (
        <>
          <p>We collect and process only the personal data necessary for the platform to function:</p>
          <ul>
            <li><strong>Account data:</strong> username, email address, secure password hash.</li>
            <li><strong>Learning progress:</strong> lesson results, achievements, activity streaks, learned gesture statistics.</li>
            <li><strong>Preferences:</strong> language and interface settings, display parameters.</li>
            <li><strong>Avatar:</strong> profile image if uploaded (stored in Cloudinary secure cloud storage).</li>
          </ul>
          <p>Your personal data is <strong>not sold</strong> or <strong>shared</strong> with third parties for commercial purposes. Data may be disclosed only as required by applicable law.</p>
          <p>You may request complete deletion of your account and associated data at any time via Settings → Personal Information → Delete Account.</p>
        </>
      ),
    },
    {
      id: 'ip',
      title: '6. Intellectual Property',
      content: (
        <>
          <p>All SignWave platform content, including educational materials, gesture videos, images, texts, logos, and software, is the intellectual property of SignWave or its licensors and is protected by copyright law.</p>
          <p>You are granted a limited, non-exclusive, non-transferable license to use the platform and its content for personal, non-commercial educational purposes only.</p>
          <p>Copying, reproducing, distributing, selling, or otherwise using platform content without SignWave's written permission is prohibited.</p>
        </>
      ),
    },
    {
      id: 'prohibited',
      title: '7. Prohibited Activities',
      content: (
        <>
          <p>When using the platform, you must not:</p>
          <ul>
            <li>attempt to gain unauthorized access to the platform, its servers, or databases;</li>
            <li>use automated tools (bots, scripts) to interact with the platform without permission;</li>
            <li>upload, distribute, or publish content that infringes third-party rights;</li>
            <li>engage in any activity that may damage the platform's operation or harm other users;</li>
            <li>use the platform for commercial purposes without SignWave's written permission;</li>
            <li>impersonate another person or provide knowingly false information.</li>
          </ul>
          <p>Violation of these prohibitions may result in immediate suspension or deletion of your account.</p>
        </>
      ),
    },
    {
      id: 'disclaimer',
      title: '8. Disclaimer of Warranties',
      content: (
        <>
          <p>The SignWave platform is provided "as is" and "as available" without any warranties. While we make every effort to ensure the accuracy of educational content, we do <strong>not guarantee</strong>:</p>
          <ul>
            <li>complete accuracy of USL gesture depictions for official, medical, or legal use;</li>
            <li>uninterrupted 24/7 platform operation;</li>
            <li>compatibility with all devices and browsers;</li>
            <li>that gesture recognition accuracy matches that of a live interpreter.</li>
          </ul>
          <p>For responsible communication with hearing-impaired individuals in official or critical situations, always consult a certified USL interpreter.</p>
        </>
      ),
    },
    {
      id: 'liability',
      title: '9. Limitation of Liability',
      content: (
        <p>To the extent permitted by applicable law, SignWave shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the platform, including data loss or disruption of the learning process.</p>
      ),
    },
    {
      id: 'termination',
      title: '10. Suspension and Deletion',
      content: (
        <>
          <p>You may delete your account at any time through the Settings section. Following deletion, all your personal data will be removed from our systems within 30 days.</p>
          <p>SignWave reserves the right to suspend or delete an account without prior notice in the event of a Terms violation or by court order.</p>
        </>
      ),
    },
    {
      id: 'law',
      title: '11. Governing Law',
      content: (
        <p>These Terms are governed by and construed in accordance with the laws of Ukraine. Any disputes arising in connection with these Terms shall be resolved in the courts of Ukraine at the location of SignWave.</p>
      ),
    },
    {
      id: 'contact',
      title: '12. Contact Information',
      content: (
        <>
          <p>For questions regarding these Terms or privacy, you may contact us:</p>
          <ul>
            <li><strong>Email:</strong> support@signwave.app</li>
            <li><strong>Platform:</strong> SignWave</li>
          </ul>
          <p>We aim to respond to all inquiries within 5 business days.</p>
        </>
      ),
    },
  ];

  const toc = sections.map(s => ({ id: s.id, title: s.title }));

  return (
    <div className="terms-page">
      <div className="terms-card">

        {/* Header */}
        <div className="terms-header">
          <div className="terms-logo">
            <div className="terms-logo__icon">🤟</div>
            <span className="terms-logo__title">SignWave</span>
          </div>
          <h1 className="terms-title">
            {isUk ? 'Умови використання' : 'Terms of Use'}
          </h1>
          <p className="terms-meta">
            {isUk ? 'Версія 1.0 · Набирає чинності: травень 2026' : 'Version 1.0 · Effective: May 2026'}
          </p>
        </div>

        <div className="terms-layout">

          {/* Table of contents */}
          <nav className="terms-toc">
            <p className="terms-toc__heading">{isUk ? 'Зміст' : 'Contents'}</p>
            {toc.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="terms-toc__link"
              >
                {item.title}
              </a>
            ))}
          </nav>

          {/* Body */}
          <div className="terms-body">
            {sections.map(section => (
              <section key={section.id} id={section.id} className="terms-section">
                <h2 className="terms-section__title">{section.title}</h2>
                <div className="terms-section__content">{section.content}</div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="terms-footer">
          <button className="terms-back-btn" onClick={() => navigate(-1)}>
            {isUk ? 'Назад' : 'Back'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
