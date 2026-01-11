import Script from "next/script";
import { Github } from "lucide-react";
import { BsIncognito } from "react-icons/bs";
import { Navbar } from "@/components/Navbar";
import { TrackedLink } from "@/components/TrackedLink";

export default function HomePage() {
  const faqItems = [
    {
      question: "Нужна ли регистрация?",
      answer: "Нет. Вы можете начать расследование сразу. Все дела доступны без создания учетной записи. Прогресс сохраняется локально в вашем браузере.",
    },
    {
      question: "Как проверяются SQL-запросы?",
      answer: "Ваши запросы проверяются нашим интеллектуальным валидатором, который сравнивает их с эталонными решениями. Система учитывает различные варианты написания одного и того же запроса.",
    },
    {
      question: "Какие знания SQL нужны?",
      answer: "Начните с простых SELECT-запросов. По мере роста уровня вы столкнетесь с JOIN, GROUP BY, подзапросами и оконными функциями. Каждое дело содержит подсказки.",
    },
    {
      question: "Поможет ли это в подготовке к собеседованиям?",
      answer: "Да. Дела имитируют реалистичные головоломки с данными, которые можно встретить на собеседованиях для аналитиков и разработчиков. Это отличная практика в увлекательном формате.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Главная",
            item: "https://www.sqlnoir.com/",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <Navbar
        title="SQL Детектив"
        titleHref="/"
        links={[
          { label: "Главная", href: "/", activeMatch: "/" },
          { label: "Архив дел", href: "/cases", activeMatch: "/cases" },
          { label: "Помощь", href: "/help", activeMatch: "/help" },
        ]}
       
      />
      <main className="relative min-h-screen bg-amber-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid gap-12 lg:grid-cols-[1fr,320px] items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-detective text-5xl md:text-6xl text-amber-900 leading-tight drop-shadow-sm">
                Станьте цифровым детективом.
              </h1>
              <p className="text-amber-800 text-lg md:text-xl max-w-2xl">
                Решайте криминальные головоломки с помощью SQL-запросов. Анализируйте улики, вычисляйте преступников и закрывайте дела в стиле нуар.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedLink
                href="/cases"
                event="cta_click"
                eventProps={{
                  cta_id: "hero-start-investigation",
                  page: "/",
                  source: "hero",
                }}
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-amber-800 hover:bg-amber-700 text-amber-50 font-detective text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Начать расследование
              </TrackedLink>
              <div className="flex items-center gap-3 text-amber-800">
               
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 max-w-3xl">
              <div className="bg-white border border-amber-100 rounded-lg p-4 shadow-sm">
                <p className="font-detective text-amber-900">
                  Реальные криминальные дела
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Каждое расследование основано на реальных сценариях. Используйте SQL-запросы, чтобы найти улики, проверить алиби и вычислить преступника.
                </p>
              </div>
              <div className="bg-white border border-amber-100 rounded-lg p-4 shadow-sm">
                <p className="font-detective text-amber-900">Интерактивная проверка решений</p>
                <p className="text-sm text-amber-700 mt-1">
                  Наш интеллектуальный валидатор проверяет ваши SQL-запросы на корректность. Не нужны базы данных или сложные настройки.
                </p>
              </div>
              <div className="bg-white border border-amber-100 rounded-lg p-4 shadow-sm">
                <p className="font-detective text-amber-900">
                  Зарабатывайте опыт детектива
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Раскрывайте дела, чтобы повысить свой уровень и получить доступ к более сложным расследованиям.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-amber-200/60 rounded-full translate-x-6 translate-y-6" />
            <div className="relative bg-amber-100/80 backdrop-blur-sm border border-amber-200 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6">
              <div className="w-40 h-40 flex items-center justify-center text-amber-900">
                <BsIncognito className="w-full h-full" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-detective text-2xl text-amber-900">
                  Добро пожаловать в отдел
                </p>
                <p className="text-amber-800">
                  Ваше первое дело ждет. Город нуждается в вас, детектив. Улики разбросаны по таблицам - соберите их воедино.
                </p>
              </div>
              <TrackedLink
                href="/cases"
                event="cta_click"
                eventProps={{
                  cta_id: "hero-card-open-case-files",
                  page: "/",
                  source: "hero-card",
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-900 text-amber-50 font-detective hover:bg-amber-800 transition-colors duration-200"
              >
                Приступить к расследованию
              </TrackedLink>
            </div>
          </div>
        </div>
        <a
          href="#learn-more"
          className="hidden lg:flex items-center gap-2 font-detective text-amber-900 hover:text-amber-700 underline underline-offset-4 absolute bottom-20 left-1/2 -translate-x-1/2"
        >
          ↓ Узнать больше ↓
        </a>
      </main>
      <section
        id="learn-more"
        className="bg-amber-50/70 border-t border-amber-200/60 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div className="space-y-4">
              <h2 className="font-detective text-3xl text-amber-900">
                Как работает SQL Детектив
              </h2>
              <div className="pl-4 space-y-2">
                <p className="text-amber-800 leading-relaxed">
                  <strong>1. Изучите дело</strong> - получите описание преступления и список подозреваемых
                </p>
                <p className="text-amber-800 leading-relaxed">
                  <strong>2. Проанализируйте схемы</strong> - изучите структуру базы данных с уликами
                </p>
                <p className="text-amber-800 leading-relaxed">
                  <strong>3. Составьте запрос</strong> - используйте SQL, чтобы найти нужную информацию
                </p>
                <p className="text-amber-800 leading-relaxed">
                  <strong>4. Проверьте решение</strong> - наш валидатор сравнит ваш запрос с эталонным
                </p>
                <p className="text-amber-800 leading-relaxed">
                  <strong>5. Закройте дело</strong> - получите объяснение и переходите к следующему расследованию
                </p>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Не требуется установка СУБД или сложных инструментов. Просто браузер и ваши навыки.
              </p>
              <div className="pt-4">
                <TrackedLink
                  href="/cases"
                  event="cta_click"
                  eventProps={{
                    cta_id: "how-it-works-start-solving",
                    page: "/",
                    source: "how-it-works",
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-900 text-amber-50 font-detective text-lg transition-colors duration-200 hover:bg-amber-800 shadow-md"
                >
                  Начать расследование
                </TrackedLink>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="font-detective text-3xl text-amber-900">
                Для кого этот проект
              </h2>
              <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6 space-y-4">
                <p className="text-amber-800 leading-relaxed">
                  • <strong>Начинающие детективы</strong> - изучайте SQL через захватывающие криминальные истории
                </p>
                <p className="text-amber-800 leading-relaxed">
                  • <strong>Опытные следователи</strong> - оттачивайте навыки сложными делами с JOIN и подзапросами
                </p>
                <p className="text-amber-800 leading-relaxed">
                  • <strong>Студенты полицейской академии</strong> - готовьтесь к реальным задачам анализа данных
                </p>
                <p className="text-amber-800 leading-relaxed">
                  • <strong>Инструкторы</strong> - используйте готовые кейсы для обучения SQL в увлекательном формате
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-detective text-3xl text-amber-900">
                Уровни сложности дел
              </h2>
              <p className="text-amber-800">
                Выберите дело по своему уровню подготовки
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <h3 className="font-detective text-xl text-green-900">🟢 Начинающий</h3>
                <p className="text-green-800 leading-relaxed">Простые SELECT-запросы. Идеально для первого знакомства с SQL.</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                <h3 className="font-detective text-xl text-yellow-900">🟡 Продвинутый</h3>
                <p className="text-yellow-800 leading-relaxed">JOIN, WHERE, GROUP BY. Для тех, кто знает основы.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-detective text-3xl text-amber-900">
                Часто задаваемые вопросы
              </h2>
              <p className="text-amber-800">
                Краткие ответы перед началом вашего первого дела.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 space-y-2">
                  <h3 className="font-detective text-xl text-amber-900">
                    {item.question}
                  </h3>
                  <p className="text-amber-800 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-xs text-amber-600 mt-4">
              Примечание: Прогресс сохраняется в вашем браузере. Для продолжения расследований используйте то же устройство и браузер.
            </div>
          </div>
        </div>
      </section>
      <Script
        id="home-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}