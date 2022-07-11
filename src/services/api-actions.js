import {ActionCreator} from "../store/action";
import {AuthorizationStatus} from "../const";
import {adaptToClient, adaptCommentsToClient} from "./data-adapter";
import {ApiPaths, AppRoute} from "../const";

const fetchOffers = () => (dispatch, getState, api) => (
  api.get(ApiPaths.HOTELS)
    .then(({data}) => {
      const offers = data.map((offer) => adaptToClient(offer));
      const state = getState();
      // console.log(`11`, offers);
      dispatch(ActionCreator.loadOffers(offers));
      dispatch(ActionCreator.changeCity(state.city));
      // console.log(`44`, state.offers);
    }
    )
);

const checkAuth = () => (dispatch, _getState, api) => (
  api.get(ApiPaths.LOGIN)
    .then(() => dispatch(ActionCreator.requireAuthorization(AuthorizationStatus.AUTH)))
    .catch(() => {})
);

// при открытии Favorites, если нет авторизации перекидывает на SignIn, и там после
// авторизации перекидывает на Главную.
const login = ({login: email, password}) => (dispatch, _getState, api) => (
  api.post(ApiPaths.LOGIN, {email, password})
    .then(() => dispatch(ActionCreator.requireAuthorization(AuthorizationStatus.AUTH)))
    .then(() => dispatch(ActionCreator.authorizedUser(email)))
    .then(() => dispatch(ActionCreator.redirectToRoute(AppRoute.MAIN)))
    .catch(() => dispatch(ActionCreator.redirectToRoute(AppRoute.LOGIN)))
);

const fetchOffer = (id) => (dispatch, _getState, api) => {
  api.get(`${ApiPaths.LOAD_OFFER}${id}`)
    .then(({data}) => {
      const offer = adaptToClient(data);
      // console.log(`11`, offer.city.name);
      dispatch(ActionCreator.loadOffer(offer));
      dispatch(ActionCreator.changeCity(offer.city.name)); //меняет город если id вдруг ввели в адресную строку
    }
    )
    .catch(() => dispatch(ActionCreator.loadFail(false)));
};

const fetchOtherOffers = (id) => (dispatch, _getState, api) => (
  api.get(ApiPaths.NEARBY_OFFERS.replace(`id`, id))
      .then(({data}) => {
        const offers = data.map((offer) => adaptToClient(offer));
        dispatch(ActionCreator.loadOtherOffers(offers));
      }
      ).catch()
);


const fetchCommentsOffer = (id) => (dispatch, _getState, api) => (
  api.get(`${ApiPaths.COMMENTS}${id}`)
    .then(({data}) => {
      const comments = data.map((comment) => adaptCommentsToClient(comment));
      // const state = getState();
      // console.log(`11`, id);
      dispatch(ActionCreator.loadCommentsOffer(comments));
      dispatch(ActionCreator.setCurrentId(id));
      // console.log(`44`, state.offers);
    }
    )
);
export {fetchOffers, checkAuth, login, fetchOffer, fetchCommentsOffer, fetchOtherOffers};
