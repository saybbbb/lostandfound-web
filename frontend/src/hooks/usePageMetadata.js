import { useEffect } from 'react';

const usePageMetadata = (title, favicon) => {
  useEffect(() => {
    const defaultTitle = "Lost and Found";
    document.title = title ? `${title} | ${defaultTitle}` : defaultTitle;

    if (favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [title, favicon]);
};

export default usePageMetadata;
