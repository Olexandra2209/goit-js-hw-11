import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './js/search-api';
import _debounce from 'lodash/debounce';

const input = document.querySelector('.search-form-input');
const gallery = document.querySelector('.gallery');
const btnSearch = document.querySelector('.search-form-button');

let gallerySimpleLightbox = new SimpleLightbox('.gallery a');

let pageNumber = 1;
let loadedImageIds = new Set();
btnSearch.addEventListener('click', async event => {
  event.preventDefault();
  cleanGallery();
  const trimmedValue = input.value.trim();
  if (trimmedValue !== '') {
    try {
      pageNumber = 1;
      loadedImageIds.clear();
      const foundData = await fetchImages(trimmedValue, pageNumber);
      if (foundData.hits.length === 0) {
        Notiflix.Notify.failure('Something went wrong :( Try again.');
      } else {
        renderImageList(foundData.hits);
        Notiflix.Notify.success(
          `Great! We found ${foundData.totalHits} images for you. Enjoy ;)`
        );
        gallerySimpleLightbox.refresh();
        pageNumber++;
      }
    } catch (error) {
      Notiflix.Notify.failure('Something went wrong :( Try again.');
    }
  }
});

const handleScroll = _debounce(async () => {
  const { clientHeight, scrollHeight, scrollTop } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    const trimmedValue = input.value.trim();
    try {
      const foundData = await fetchImages(trimmedValue, pageNumber);
      if (foundData.hits.length === 0) {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        const uniqueImages = foundData.hits.filter(
          image => !loadedImageIds.has(image.id)
        );
        renderImageList(uniqueImages);
        Notiflix.Notify.success();
        gallerySimpleLightbox.refresh();
        pageNumber++;
        uniqueImages.forEach(image => loadedImageIds.add(image.id));
      }
    } catch (error) {
      Notiflix.Notify.failure('Something went wrong :( Try again.');
    }
  }
}, 500);

window.addEventListener('scroll', handleScroll);

function renderImageList(images) {
  const markup = images
    .map(image => {
      return `<div class="photo-card">
      <a href="${image.largeImageURL}"><img class="photo" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/></a>
      <div class="info">
         <p class="info-item">
           <b>Likes</b> <span class="info-item-api"> ${image.likes} </span>
         </p>
         <p class="info-item">
           <b>Views</b> <span class="info-item-api">${image.views}</span>
         </p>
         <p class="info-item">
           <b>Comments</b> <span class="info-item-api">${image.comments}</span>
         </p>
         <p class="info-item">
           <b>Downloads</b> <span class="info-item-api">${image.downloads}</span>
         </p>
      </div>
      </div>`;
    })
    .join('');
  gallery.innerHTML += markup;
}

function cleanGallery() {
  gallery.innerHTML = '';
  pageNumber = 1;
}
