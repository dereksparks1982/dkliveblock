/* DK Live Block Build 259: local interface language controls.
   Russian is the first translated UI. English remains the safe fallback.
   This never changes network filters, user locale, websites or cookie data. */
(function(root){"use strict";
const KEY="dkUiLanguage";
const SUPPORTED=Object.freeze(["en","ru"]);
const PLANNED=Object.freeze(["ar","tr","ur","fa"]);
const RU=Object.freeze({
"Development build":"Тестовая версия",
"blocked on this tab":"заблокировано в этой вкладке",
"blocked on selected website tab":"заблокировано на выбранном сайте",
"View blocked":"Заблокированные",
"View blocked requests for this tab":"Просмотреть заблокированные запросы этой вкладки",
"permitted requests":"разрешённых запросов",
"View allowed":"Разрешённые",
"Protection everywhere":"Защита на всех сайтах",
"Allowed website":"Разрешённый сайт",
"Current site":"Текущий сайт",
"Allowlist website":"Добавить сайт в исключения",
"Remove from allowlist":"Убрать сайт из исключений",
"Allowlisting disables automatic filters here; any selective blocks you choose remain active. Other websites stay protected.":"Разрешение сайта отключает здесь автоматические фильтры. Выбранные блокировки остаются активными. Другие сайты защищены.",
"Only this tab":"Только эта вкладка",
"Pause this tab":"Приостановить в этой вкладке",
"Resume this tab":"Возобновить в этой вкладке",
"Popup cleanups:":"Очистка всплывающих окон:",
"Disable popup cleanup here":"Отключить очистку здесь",
"Enable popup cleanup here":"Включить очистку здесь",
"Fine-tune this website":"Настроить защиту этого сайта",
"Cookie rejection":"Отклонение файлов cookie",
"Newsletter and distraction cleanup":"Удаление рассылок и отвлекающих элементов",
"Disable here":"Отключить здесь",
"Enable here":"Включить здесь",
"These exceptions leave ad and tracker blocking active. No website is allowlisted.":"Эти исключения не отключают блокировку рекламы и трекеров. Сайт не добавляется в список разрешённых.",
"Strict scam-tab protection":"Строгая защита от мошеннических вкладок",
"Unwanted new tabs stopped:":"Остановлено нежелательных вкладок:",
"Allow next new tab (15 seconds)":"Разрешить следующую вкладку (15 секунд)",
"Unrequested new tabs from this site are blocked.":"Незапрошенные вкладки с этого сайта блокируются.",
"Playback Rescue":"Восстановление видео",
"Enable media rescue":"Включить восстановление видео",
"Disable media rescue":"Отключить восстановление видео",
"Allows media requests on this site. Some video ads may play.":"Разрешает медиазапросы на этом сайте. Некоторые видеообъявления могут воспроизводиться.",
"Blocked streaming requests:":"Заблокировано потоковых запросов:",
"Inspect":"Проверить",
"Temporary playback repair active for this tab. Expires within 10 minutes.":"Временное исправление воспроизведения активно для этой вкладки. Истекает в течение 10 минут.",
"Failed resources:":"Ошибки загрузки:",
"Network recovery":"Восстановление сети",
"Hide an element":"Скрыть элемент",
"Undo hide":"Отменить скрытие",
"Update lists":"Обновить списки",
"Investigate missed ad · Local AI assist":"Изучить пропущенную рекламу · локальный помощник",
"Site dashboard · Protection and exceptions":"Панель сайта · защита и исключения",
"Inspect element-hiding filters":"Проверить фильтры скрытия элементов",
"Network Monitor · View requests and blocked traffic":"Монитор сети · запросы и блокировки",
"▶ Current YouTube video":"▶ Текущее видео YouTube",
"Save for Later":"Сохранить на потом",
"Download quality":"Качество загрузки",
"Compatible MP4 (no FFmpeg needed)":"Совместимый MP4 (FFmpeg не требуется)",
"Best video + audio (requires FFmpeg)":"Лучшее видео + аудио (нужен FFmpeg)",
"Audio only (original format)":"Только аудио (исходный формат)",
"Download This Video":"Скачать это видео",
"Cancel Download":"Отменить загрузку",
"Retry Download":"Повторить загрузку",
"Downloads require the optional Linux companion and verified yt-dlp.":"Для загрузки требуется дополнительный компонент Linux и проверенный yt-dlp.",
"Loading…":"Загрузка…",
"My Saved Videos":"Сохранённые видео",
"My Downloads":"Мои загрузки",
"Dependencies":"Зависимости",
"Report a problem":"Сообщить о проблеме",
"Settings, privacy and logs":"Настройки, конфиденциальность и журналы",
"No account · No telemetry · No paywall":"Без учётной записи · Без телеметрии · Без платных ограничений",
"GitHub Repository":"Репозиторий GitHub",
"Patreon":"Patreon",
"Interface language":"Язык интерфейса",
"English":"Английский",
"Russian":"Русский",
"Privacy first. Everything free.":"Конфиденциальность прежде всего. Всё бесплатно.",
"Protection settings":"Настройки защиты",
"Threat database & protection":"База угроз и защита",
"Threat protection overrides":"Исключения для защиты от угроз",
"Strict popunder and scam-tab protection":"Строгая защита от нежелательных вкладок и мошенничества",
"Dependencies & Applications":"Зависимости и приложения",
"Optional integration tools":"Дополнительные инструменты",
"Recommended applications":"Рекомендуемые приложения",
"Advanced browser tools":"Дополнительные инструменты браузера",
"Protection-first defaults":"Настройки защиты по умолчанию",
"Website cleanup exceptions":"Исключения очистки сайтов",
"Website notification requests":"Запросы уведомлений",
"Filter subscriptions":"Подписки на фильтры",
"YouTube player advertising metadata":"Рекламные данные проигрывателя YouTube",
"YouTube compatibility updates":"Обновления совместимости YouTube",
"Language-specific filter lists":"Языковые списки фильтров",
"Enable lists matching my Firefox languages":"Включить списки для языков Firefox",
"Additional filter lists":"Дополнительные списки фильтров",
"Video and cookies":"Видео и файлы cookie",
"Streaming playback diagnostics":"Диагностика потокового видео",
"Streaming player health (local)":"Состояние видеопроигрывателя (локально)",
"Temporary streaming playback repair":"Временное исправление воспроизведения",
"DK Network Recovery / Proxy Settings":"Сетевые настройки DK / Прокси",
"DNS diagnostics":"Диагностика DNS",
"Failed images and sites":"Ошибки изображений и сайтов",
"Custom filters":"Пользовательские фильтры",
"Allowed Websites":"Разрешённые сайты",
"Advanced: edit allowed hostnames manually":"Дополнительно: изменить разрешённые домены вручную",
"Website repair and exceptions":"Исправление сайтов и исключения",
"Network Monitor":"Монитор сети",
"Private request log":"Локальный журнал запросов",
"Statistics":"Статистика",
"Settings backup":"Резервная копия настроек",
"Export JSON":"Экспорт JSON",
"Save settings":"Сохранить настройки",
"Help and bug reports":"Помощь и сообщения об ошибках",
"Open Network Monitor":"Открыть монитор сети",
"Blocked-request counters are stored locally. Reset removes counts and temporary logs.":"Счётчики блокировок хранятся локально. Сброс удаляет счётчики и временные журналы.",
"Reset statistics":"Сбросить статистику",
"Prepare a bug report":"Подготовить сообщение об ошибке",
"Language":"Язык",
"Allowlist this website":"Разрешить этот сайт",
"Browser page":"Страница браузера",
"Enable cookie rejection here":"Включить отклонение cookie здесь",
"Disable cookie rejection here":"Отключить отклонение cookie здесь",
"Enable distraction cleanup here":"Включить очистку отвлекающих элементов",
"Disable distraction cleanup here":"Отключить очистку отвлекающих элементов",
"Resume popup cleanup":"Возобновить очистку всплывающих окон",
"One new tab is temporarily allowed. This permission expires within 15 seconds.":"Одна новая вкладка временно разрешена. Разрешение истекает через 15 секунд.",
"Allowlisting disables automatic filters here; manually selected blocks stay active. Other sites remain protected.":"Здесь отключаются автоматические фильтры; выбранные вручную блокировки остаются. Остальные сайты защищены.",
"This site's optional cleanup was changed. Network ad and tracker blocking remains on.":"Дополнительная очистка сайта изменена. Блокировка сетевой рекламы и трекеров остаётся активной.",
"Reload the tab and try again.":"Перезагрузите вкладку и повторите попытку.",
"Open a normal website tab to inspect an ad.":"Чтобы проверить рекламу, откройте обычный сайт.",
"Investigation unavailable here. Reload the tab and retry.":"Проверка здесь недоступна. Перезагрузите вкладку и повторите.",
"Reload this website tab and retry the investigation.":"Перезагрузите сайт и повторите проверку.",
"Last page-only hidden element restored.":"Последний скрытый элемент страницы восстановлен.",
"Last investigated item restored.":"Последний проверенный элемент восстановлен.",
"Nothing to undo. Refresh the webpage to restore manually hidden elements.":"Нечего отменять. Обновите страницу, чтобы вернуть вручную скрытые элементы.",
"Download complete. Saved to ~/.local/share/dk-live-block/downloads/":"Загрузка завершена. Сохранено в ~/.local/share/dk-live-block/downloads/",
"Cancelling download…":"Отмена загрузки…",
"Download requested. Open this menu again to check progress.":"Загрузка запрошена. Откройте меню снова, чтобы проверить состояние.",
"Saved to My Saved Videos":"Сохранено в «Мои видео»",
"Use English":"Использовать английский",
"Development build. Full Firefox compatibility, reproducible packaging, and Adblock Plus feature parity are still pending. Video ad blocking varies by site.":"Тестовая версия. Полная совместимость с Firefox, воспроизводимая сборка и функциональное равенство с Adblock Plus пока не достигнуты. Блокировка видеорекламы зависит от сайта.",
"Interface & Tools":"Интерфейс и инструменты",
"These options control how you interact with the blocker. They do not reduce blocking coverage.":"Эти настройки определяют, как вы взаимодействуете с блокировщиком. Они не уменьшают охват блокировки.",
"DK Live Block never shows paid promotions, sponsor messages, Acceptable Ads or upgrade nags.":"DK Live Block никогда не показывает платную рекламу, спонсорские сообщения, «допустимую рекламу» или предложения купить обновление.",
"There is no marketing switch to hunt down.":"Никакого скрытого переключателя маркетинга искать не нужно.",
"Show the number of blocked requests on the Firefox toolbar icon":"Показывать число заблокированных запросов на значке в панели Firefox",
"Add a right-click \"Block element with DK Live Block\" command":"Добавить в контекстное меню команду «Заблокировать элемент через DK Live Block»",
"The right-click command starts the existing visual element picker on the current website. It never acts on browser-internal or file pages, does not upload page contents, and won't run when DK Live Block is paused. Firefox may ask for context-menu access when installing this development version.":"Команда контекстного меню запускает выбор элемента на текущем сайте. Она не действует на внутренних страницах браузера и локальных файлах, не передаёт содержимое страницы и не работает при приостановленной защите. При установке этой тестовой версии Firefox может запросить доступ к контекстному меню.",
"Show DK Live Block's optional network inspection panel inside Firefox Developer Tools":"Показывать дополнительную панель проверки сети DK Live Block в инструментах разработчика Firefox",
"Firefox may ask for additional Developer Tools access when you enable the panel. It stays disabled until you approve the permission and save Settings. Reopen Firefox Developer Tools to show it. This panel displays local, opt-in hostname-level request capture only, without sending browsing data anywhere.":"Для панели Firefox может запросить дополнительный доступ к инструментам разработчика. До вашего разрешения и сохранения настроек панель выключена. Чтобы её увидеть, снова откройте инструменты разработчика. Панель показывает только включённый вами локальный журнал запросов по доменам и никуда не отправляет данные о посещениях.",
"A non-destructive element-hiding debug overlay is still a separate outstanding feature and is not claimed as complete.":"Неизменяющая страницу отладочная подсветка скрываемых элементов пока разрабатывается и не считается готовой.",
"Core Protections":"Основные средства защиты",
"Block domains listed by the phishing threat feed (recommended, ON by default)":"Блокировать домены из списка фишинговых угроз (рекомендуется, включено по умолчанию)",
"Threat protection is separate from advertising filters. It checks a locally cached database before a website or resource loads, including when a website is allowlisted for ads. Only exact reported hostnames are blocked. A listing is not proof of a site's owner or intent.":"Защита от угроз работает отдельно от рекламных фильтров. Она проверяет локально сохранённую базу до загрузки сайта или ресурса, даже если сайт внесён в исключения для рекламы. Блокируются только точно указанные доменные имена. Наличие в списке не доказывает владельца сайта или его намерения.",
"Threat database status loading…":"Загрузка состояния базы угроз…",
"Update threat database now":"Обновить базу угроз сейчас",
"Source:":"Источник:",
"Phishing Army's phishing-domain intelligence":"Список фишинговых доменов Phishing Army",
". The extension downloads the list, not your visited URLs. The publisher sees an IP requesting a feed update. Updates normally run daily when automatic updates are enabled. More threat categories will require independently reviewed feeds.":". Расширение скачивает список, а не адреса посещённых вами страниц. Издатель видит IP-адрес, с которого запрошено обновление списка. При включённых автоматических обновлениях проверка обычно выполняется ежедневно. Для дополнительных типов угроз понадобятся независимо проверенные источники.",
"Enter":"Введите",
"exact destination hostnames":"точные имена доменов назначения",
", one per line, to allow despite a listing. Overrides may expose you to deceptive pages. Remove an entry to restore protection. Turning off the main switch disables threat-list blocking without affecting ordinary ad filtering.":", по одному в строке, чтобы разрешить их несмотря на запись в списке. Исключения могут открыть доступ к обманным страницам. Удалите запись, чтобы восстановить защиту. Главный переключатель отключает проверку списка угроз, не затрагивая обычную блокировку рекламы.",
"Block all new tabs and windows launched from The Pirate Bay and 1337x sites (recommended)":"Блокировать все новые вкладки и окна, открываемые сайтами The Pirate Bay и 1337x (рекомендуется)",
"Enabled by default. This stops new tabs opened from these sites even when the destination is blank or uses a constantly changing ad domain. It may also block a legitimate link you intentionally open in another tab. Magnet downloads and normal same-tab navigation are not targeted.":"Включено по умолчанию. Защита останавливает новые вкладки с этих сайтов, даже когда адрес пустой или рекламный домен постоянно меняется. Она может заблокировать и нужную ссылку, которую вы специально открыли в новой вкладке. Magnet-ссылки и обычные переходы в той же вкладке не затрагиваются.",
"When you actually need a new tab from one of these sites, click DK Live Block's":"Если вам действительно нужна новая вкладка с такого сайта, нажмите кнопку DK Live Block",
"button, then open it. Only one new tab is permitted. A scam tab could consume that one-time allowance first, so use this only when needed.":"и затем откройте ссылку. Разрешается только одна новая вкладка. Мошенническая вкладка может первой воспользоваться этим разрешением, поэтому включайте его лишь при необходимости.",
"This does not disable Firefox's own popup blocking. Site variants and new attack techniques still require real browser verification.":"Это не отключает встроенную блокировку всплывающих окон Firefox. Варианты сайтов и новые методы атак по-прежнему требуют проверки в настоящем браузере.",
"Advertising, tracking, cookie-notice, annoyance and social-widget filter lists are enabled for new installations. Explicit cookie rejection and conservative distraction protection are enabled too.":"В новых установках включены списки фильтров рекламы, отслеживания, уведомлений о cookie, назойливых элементов и социальных виджетов. Также включены отклонение необязательных cookie и осторожное скрытие отвлекающих элементов.",
"There is no Acceptable Ads program or paid protection tier.":"Здесь нет программы «допустимой рекламы» и платного уровня защиты.",
"You may turn individual protections off, and your saved choices are respected. A list only protects you once downloaded; use the status below to check downloads.":"Вы можете отключать отдельные функции защиты, и сохранённые настройки будут соблюдаться. Список начинает защищать только после загрузки; проверяйте состояние ниже.",
"Block new website notification permission prompts across Firefox":"Блокировать новые запросы сайтов на разрешение уведомлений во всём Firefox",
"On by default. This changes Firefox's browser-wide default notification permission to Deny, not just the current website. It does not override a website you explicitly allowed earlier. Turning it off releases DK Live Block's override without changing another extension's settings. Firefox may require permission for this browser-wide feature.":"Включено по умолчанию. Это устанавливает для уведомлений Firefox общее правило «Запретить», а не только для текущего сайта. Ранее разрешённые вручную сайты не затрагиваются. При отключении DK Live Block снимает своё правило, не меняя настройки других расширений. Firefox может запросить разрешение на эту общебраузерную функцию.",
"Checking Firefox notification permission setting…":"Проверка разрешений на уведомления в Firefox…",
"Click available YouTube Skip Ad buttons":"Нажимать доступные кнопки «Пропустить рекламу» на YouTube",
"Remember unfinished YouTube videos automatically (local only, off by default)":"Автоматически запоминать недосмотренные видео YouTube (только локально, по умолчанию выключено)",
"When enabled, DK Live Block saves your position in ordinary YouTube videos after you've watched at least one minute, and periodically updates it while you watch. It never syncs your viewing history or contacts DK servers. Turn it off to stop new automatic saves; already saved videos remain in your library until you remove them. The library's Erase saved-video history action clears the saved list and last download status, and switches automatic remembering off.":"Если включено, DK Live Block сохраняет место остановки обычного видео YouTube после просмотра хотя бы одной минуты и периодически обновляет его. История просмотров не синхронизируется и не отправляется на серверы DK. Отключение прекращает новые автоматические сохранения; ранее сохранённые видео остаются в библиотеке до удаления. Команда «Стереть историю сохранённых видео» очищает список и состояние последней загрузки, а также выключает автозапоминание.",
"Automatically hide clearly identified advertising containers (reversible, conservative)":"Автоматически скрывать надёжно распознанные рекламные блоки (обратимо, осторожный режим)",
"Experimental: compact video-thumbnail grids and empty ad spaces on Pornhub only":"Эксперимент: уплотнять сетки миниатюр и пустые рекламные места только на Pornhub",
"Optional and off by default. Reflows recognized video lists using local CSS; does not load additional videos or change the player. Disable this option or pause protection to restore the original page layout. The site may change its markup, and real-browser testing is pending.":"Дополнительная функция, по умолчанию выключена. Меняет размещение распознанных списков видео с помощью локального CSS; не загружает дополнительные видео и не меняет проигрыватель. Чтобы вернуть исходную компоновку, отключите функцию или приостановите защиту. Разметка сайта может измениться; проверка в браузере ещё не завершена.",
"Reject optional cookies only when a clearly identified button exists (on by default)":"Отклонять необязательные cookie только при наличии ясно обозначенной кнопки (включено по умолчанию)",
"Hide confidently identified newsletter, survey and floating corner-ad overlays (on by default; never hide active video players)":"Скрывать надёжно распознанные окна рассылок, опросов и угловой рекламы (включено по умолчанию; не скрывать работающие видеопроигрыватели)",
"Hide popups asking me to disable DK Live Block (includes YouTube notices where possible)":"Скрывать окна с просьбой отключить DK Live Block (по возможности включая сообщения YouTube)",
"Hide subscription popups covering already-loaded articles (Wall Street Journal, BBC and other sites where possible)":"Скрывать подписные окна поверх уже загруженных статей (по возможности на Wall Street Journal, BBC и других сайтах)",
"This does not create access to missing articles or unlock server-side subscriptions. Turn this off per preference, or pause DK Live Block on an affected site.":"Это не открывает доступ к незагруженным статьям и не обходит подписку на сервере. При желании отключите функцию или приостановите DK Live Block на затронутом сайте.",
"Remove marketing tracking parameters from website addresses (never video or API requests)":"Удалять маркетинговые параметры отслеживания из адресов сайтов (не из видео и API-запросов)",
"Filters & Subscriptions":"Фильтры и подписки",
"Every list can be turned on or off and updated individually. Existing downloaded rules remain cached if an update fails. Never let a failed list turn advertising protection off silently.":"Каждый список можно отдельно включать, выключать и обновлять. При ошибке обновления ранее загруженные правила остаются в кеше. Не допускайте незаметного отключения рекламной защиты из-за сбоя загрузки списка.",
"Loading built-in filter lists…":"Загрузка встроенных списков фильтров…",
"Daily automatic updates":"Ежедневные автоматические обновления",
"Update all enabled lists":"Обновить все включённые списки",
"Supplementary filters for websites in other languages. None are downloaded until you enable them. Clicking the recommendation button reads your Firefox language preferences locally.":"Дополнительные фильтры для сайтов на других языках. Они не скачиваются, пока вы их не включите. Кнопка рекомендаций проверяет ваши языковые предпочтения Firefox только локально.",
"All language lists are initially off. Extra subscriptions consume memory and can slow browsing.":"Изначально все языковые списки выключены. Дополнительные подписки занимают память и могут замедлять браузер.",
"Arabic Liste AR supplements Liste FR and EasyList. Enable the French list alongside Arabic. Language-list sources are documented in the regional catalog.":"Арабский список Liste AR дополняет Liste FR и EasyList. Включайте французский список вместе с арабским. Источники языковых списков приведены в региональном каталоге.",
"Up to five HTTPS subscription URLs. Add with the field below and Save Settings, or manage each saved list with its Refresh and Remove controls. Filter rules are data, never executable scripts.":"До пяти HTTPS-адресов подписок. Добавляйте их в поле ниже и нажимайте «Сохранить настройки» либо управляйте списками кнопками «Обновить» и «Удалить». Правила фильтрации являются данными, а не исполняемыми сценариями.",
"Custom list URLs (advanced editor)":"Адреса пользовательских списков (расширенный редактор)",
"No additional lists installed.":"Дополнительные списки не установлены.",
"Some ABP syntax is supported. Advanced scriptlets and redirects are not.":"Поддерживается часть синтаксиса ABP. Продвинутые скриптлеты и перенаправления не поддерживаются.",
"Check custom filter syntax":"Проверить синтаксис пользовательских фильтров",
"Custom rules have not been checked. Checking is local and does not save or change any filters.":"Пользовательские правила ещё не проверены. Проверка выполняется локально и не сохраняет и не меняет фильтры.",
"Syntax checking recognizes a supported subset of Adblock Plus filtering. Unsupported or duplicated rules are identified by line number, without uploading the rules or displaying their contents in diagnostics. Save Settings remains a separate, explicit action.":"Проверка синтаксиса распознаёт поддерживаемую часть правил Adblock Plus. Неподдерживаемые и повторяющиеся правила отмечаются номерами строк без передачи текста правил или показа его в диагностике. Сохранение настроек остаётся отдельным действием.",
"Website Exceptions":"Исключения для сайтов",
"Cookie rejection and newsletter/distraction cleanup can be turned off for individual websites without disabling advertisement or tracker blocking. The toolbar changes the current site; you can remove saved exceptions below. A parent hostname affects its subdomains.":"Отклонение cookie и очистку от рассылок и отвлекающих элементов можно отключать для отдельных сайтов, не выключая блокировку рекламы и трекеров. Панель инструментов управляет текущим сайтом; сохранённые исключения можно удалить ниже. Исключение для родительского домена действует и на поддомены.",
"Refresh site exceptions":"Обновить исключения сайтов",
"Loading site exceptions…":"Загрузка исключений сайтов…",
"Allowlist a website if you want DK Live Block to stop blocking there. An entry covers that hostname and its subdomains; every other website remains protected. No ads are allowed globally and there is no paid whitelist.":"Добавьте сайт в список разрешённых, если хотите отключить блокировку на нём. Запись охватывает домен и его поддомены; все остальные сайты остаются защищёнными. Глобального разрешения рекламы и платного списка исключений нет.",
"Website to allowlist":"Сайт для добавления в исключения",
"Add website":"Добавить сайт",
"Loading allowed websites…":"Загрузка разрешённых сайтов…",
"One hostname per line. Manual edits take effect after clicking Save Settings. No URLs or wildcards.":"По одному доменному имени в строке. Изменения вступают в силу после нажатия «Сохранить настройки». Без URL и шаблонов со звёздочками.",
"Review requests you allowed on an individual website and revoke only the permission causing a problem. Revocation restores the normal filtering rules without disabling the whole blocker.":"Просмотрите запросы, разрешённые для отдельного сайта, и отзовите только проблемное разрешение. Отзыв восстанавливает обычные правила фильтрации, не отключая весь блокировщик.",
"Show allowances for recent website":"Показать разрешения для недавнего сайта",
"Video & Streaming":"Видео и потоковое воспроизведение",
"Remove known ad placements from eligible YouTube player JSON responses":"Удалять известные рекламные блоки из подходящих JSON-ответов проигрывателя YouTube",
"On by default. Firefox-only, limited to first-party YouTube player/get_watch JSON. Does not change video bytes, DRM, login, or unrecognized responses. It may stop working if YouTube changes its format and can be turned off if playback breaks. A response modification is not proof that a video played without ads.":"Включено по умолчанию и работает только в Firefox с собственными JSON-ответами YouTube для player/get_watch. Не изменяет видео, DRM, вход в аккаунт и нераспознанные ответы. Если YouTube изменит формат, функция может перестать работать; при проблемах с воспроизведением её можно отключить. Изменённый ответ сам по себе не доказывает отсутствие рекламы при просмотре.",
"Data-only YouTube rule packs can update without requiring a new extension version. Downloads come from the DK Live Block public GitHub repository. Firefox add-on updates remain necessary for changes to executable code.":"Пакеты правил YouTube, содержащие только данные, могут обновляться без новой версии расширения. Загрузка идёт из публичного репозитория DK Live Block на GitHub. Для изменений исполняемого кода по-прежнему требуется обновление расширения Firefox.",
"Automatically check DK's YouTube compatibility pack when updating filters":"Автоматически проверять пакет совместимости DK для YouTube при обновлении фильтров",
"Built-in protection is active. No remote pack installed.":"Встроенная защита активна. Внешний пакет не установлен.",
"Check YouTube rules now":"Проверить правила YouTube сейчас",
"Roll back YouTube rules":"Откатить правила YouTube",
"Only simple ad-specific cosmetic selectors are accepted. If a bad update causes problems, roll it back. That version stays disabled until a newer version is published. Remote scripts are never downloaded or executed.":"Принимаются только простые косметические селекторы рекламы. Если ошибочное обновление вызывает неполадки, откатите его. Эта версия останется отключённой до выхода более новой. Внешние сценарии никогда не скачиваются и не выполняются."
});
function supported(code){return SUPPORTED.includes(code)?code:"en";}
function translate(text,language){
 if(language!=="ru"||typeof text!=="string")return text;
 return Object.prototype.hasOwnProperty.call(RU,text)?RU[text]:text;
}
const nodeOriginals=new WeakMap(),attributeOriginals=new WeakMap();
const EXCLUDED=new Set(["SCRIPT","STYLE","TEXTAREA","PRE","CODE","OPTION","INPUT"]);
function eligible(node){
 let p=node?.parentElement||null;
 while(p){if(EXCLUDED.has(p.tagName)||p.isContentEditable)return false;p=p.parentElement;}
 return true;
}
function rewrite(node,language){
 if(node?.nodeType!==3||!eligible(node))return;
 const actual=String(node.nodeValue||"");
 const m=actual.match(/^(\s*)([\s\S]*?)(\s*)$/);
 if(!m)return;
 let original=nodeOriginals.get(node);
 if(original&&actual.trim()!==original&&actual.trim()!==translate(original,"ru"))
  original=null; // Host UI re-rendered a different message.
 if(!original){
  if(!Object.prototype.hasOwnProperty.call(RU,m[2]))return;
  original=m[2];nodeOriginals.set(node,original);
 }
 const desired=m[1]+translate(original,language)+m[3];
 if(actual!==desired)node.nodeValue=desired;
}
function attributes(el,language){
 if(!el?.getAttribute||!eligible({parentElement:el}))return;
 for(const attr of ["aria-label","title","placeholder"]){
  const current=el.getAttribute(attr);if(!current)continue;
  let entries=attributeOriginals.get(el);
  if(!entries){entries=new Map();attributeOriginals.set(el,entries);}
  let original=entries.get(attr);
  if(original&&current!==original&&current!==translate(original,"ru"))original=null;
  if(!original){
   if(!Object.prototype.hasOwnProperty.call(RU,current))continue;
   original=current;entries.set(attr,original);
  }
  const desired=translate(original,language);
  if(current!==desired)el.setAttribute(attr,desired);
 }
}
function apply(rootNode,language){
 const lang=supported(language);
 const container=rootNode?.nodeType===9?rootNode.documentElement:rootNode;
 if(!container)return;
 if(container.nodeType===3){rewrite(container,lang);return;}
 if(container.nodeType===1)attributes(container,lang);
 const doc=container.ownerDocument||rootNode;
 if(!doc?.createTreeWalker)return;
 const texts=doc.createTreeWalker(container,4),elements=doc.createTreeWalker(container,1);
 let cursor;while((cursor=texts.nextNode()))rewrite(cursor,lang);
 while((cursor=elements.nextNode()))attributes(cursor,lang);
 if(doc.documentElement)doc.documentElement.lang=lang;
}
function init(){
 if(typeof document==="undefined"||typeof browser==="undefined")return;
 const select=document.getElementById("dkUiLanguage");
 if(!select)return;
 let current="en",observer=null;
 const redraw=()=>apply(document,current);
 function activate(value){current=supported(value);select.value=current;redraw();}
 select.addEventListener("change",()=>{
  const value=supported(select.value);
  activate(value);
  browser.storage.local.set({[KEY]:value}).catch(error=>console.warn("Unable to save interface language preference:",error));
 });
 browser.storage.local.get(KEY).then(data=>activate(data?.[KEY])).catch(()=>activate("en"));
 browser.storage.onChanged?.addListener((changes,area)=>{
  if(area==="local"&&changes[KEY])activate(changes[KEY].newValue);
 });
 if(typeof MutationObserver==="function"){
  observer=new MutationObserver(records=>{
   let scanned=0;
   for(const r of records){
    if(scanned++>150)break;
    if(r.type==="characterData")rewrite(r.target,current);
    else if(r.type==="childList"){
     for(const n of Array.from(r.addedNodes||[]).slice(0,40))apply(n,current);
    }
   }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 }
}
const API=Object.freeze({KEY,SUPPORTED,PLANNED,supported,translate,apply,init});
root.DKUILanguage=API;
if(typeof module!=="undefined")module.exports=API;
if(typeof document!=="undefined"&&typeof browser!=="undefined")init();
})(typeof globalThis!=="undefined"?globalThis:this);
