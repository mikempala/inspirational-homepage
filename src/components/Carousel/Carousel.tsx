import { useEffect, useState } from 'react';
import { Container } from './CarouselContainer';
import mockedImagesPage from './mockedImagesPage.json';
import { useNotifications } from '../hooks/useNotifications';
import { CAROUSEL_ERROR } from '../common/errors';
import ImageContainer from './ImageContainer';

type FetchStatus = 'loading' | 'successful' | 'error';
type Page = typeof mockedImagesPage;
type Images = Page['results'];

const UNSPLASH_API_URL =
  'https://api.unsplash.com/search/photos?' +
  new URLSearchParams({
    query: 'nature',
    per_page: '5',
    orientation: 'landscape',
    page: Math.floor(Math.random() * 30 + 1).toString(),
  }).toString();

const UNSPLASH_URL = 'https://unsplash.com/';
const UTM_PARAMS = '?utm_source=inspirational_homepage&utm_medium=referral';

const Carousel: React.FC = () => {
  const { addNotification } = useNotifications();

  const [images, setImages] = useState<Images>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('loading');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImage = images[currentImageIndex];
  const userUrl =
    UNSPLASH_URL + '@' + currentImage?.user?.username + UTM_PARAMS;

  useEffect(() => {
    let ignore = false;

    const fetchImages = async () => {
      try {
        setFetchStatus('loading');

        const response: Response = await fetch(UNSPLASH_API_URL, {
          cache: 'no-cache',
          headers: {
            'Accept-Version': 'v1',
            Authorization: `Client-ID ${
              import.meta.env.VITE_UNSPLASH_ACCESS_KEY
            }`,
          },
        });

        const data = (await response.json()) as Page;

        if (!ignore) {
          setFetchStatus('successful');
          setImages(data.results);
        }
      } catch (error) {
        if (!ignore) {
          console.error('Carousel error: ', error);
          setFetchStatus('error');
          addNotification(CAROUSEL_ERROR);
        }
      }
    };

    void fetchImages();

    return () => {
      ignore = true;
    };
  }, [addNotification]);

  if (fetchStatus === 'error' || !currentImage) return <></>;

  return (
    <Container>
      {images.map(({ id, blur_hash, urls, alt_description }, index) => (
        <ImageContainer
          key={id}
          hash={blur_hash}
          index={index}
          displayImage={currentImageIndex === index}
          src={urls.full}
          alt={alt_description}
        />
      ))}
      <button
        aria-label="Change background to previous image"
        disabled={currentImageIndex === 0}
        onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
      >
        &lt;
      </button>
      <button
        aria-label="Change background to next image"
        disabled={currentImageIndex === images.length - 1}
        onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
      >
        &gt;
      </button>
      <p>
        Photo by{' '}
        <a href={userUrl} rel="noopener noreferrer" target="_blank">
          {currentImage.user.name}
        </a>{' '}
        on{' '}
        <a
          href={UNSPLASH_URL + UTM_PARAMS}
          rel="noopener noreferrer"
          target="_blank"
        >
          Unsplash
        </a>
      </p>
    </Container>
  );
};

export default Carousel;
