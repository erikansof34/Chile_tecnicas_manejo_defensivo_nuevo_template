export function init() {
  loadIframe({
    id: 'Slide2-3Web',
    src: 'https://iframe.mediadelivery.net/embed/450631/3415c5f2-0b27-4f7a-98a1-b589dbc549c4?autoplay=true&loop=false&muted=false&preload=true&responsive=true',
    className: 'iframe-video-vertical-web',
    style: 'width: 20vw; height: 80vh; min-height: 300px;',
  });

  loadIframe({
    id: "Slide2-3Mobile",
    src: "https://iframe.mediadelivery.net/embed/450631/3415c5f2-0b27-4f7a-98a1-b589dbc549c4?autoplay=true&loop=false&muted=false&preload=true&responsive=true",
    className: "iframe-video-vertical-mobil",
    style: "width: 20vw; height: 70vh; min-height: 300px;"
  });

}
