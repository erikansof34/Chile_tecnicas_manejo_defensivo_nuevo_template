export function init() {
  loadIframe({
    id: 'Slide2-6Web',
    src: 'https://iframe.mediadelivery.net/embed/448139/5dd3a881-335b-4f0b-8d3b-8b8e5ed66aff?autoplay=false&loop=false&muted=false&preload=true&responsive=true',
    className: 'iframe-video-horizontal-web',
    style: 'width: 40vw; height: 50vh; min-height: 300px;',
  });

  loadIframe({
    id: "Slide2-6Mobile",
    src: "https://iframe.mediadelivery.net/embed/448139/5dd3a881-335b-4f0b-8d3b-8b8e5ed66aff?autoplay=false&loop=false&muted=false&preload=true&responsive=true",
    className: "iframe-video-vertical-mobil",
    style: "width: 20vw; height: 70vh; min-height: 300px;"
  });

}
