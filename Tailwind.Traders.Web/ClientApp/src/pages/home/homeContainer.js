import React, { Component, Fragment } from "react";
import { connect } from 'react-redux';
import Displays from "../../assets/images/displays.jpg";
import Chargers from "../../assets/images/charger.jpg";
import Cables from "../../assets/images/cable.jpg";
import Controllers from "../../assets/images/controller.jpg";
import { ProductService } from "../../services";
import Home from "./home";

class HomeContainer extends Component {
    constructor() {
        super();
        this.state = {
            recommendedProducts: [
            ],
            defaultProducts: [
                {
                    title: "Displays",
                    imageUrl: Displays,
                    cssClass: "grid__item-a",
                    url: "/"
                },
                {
                    title: "Chargers",
                    imageUrl: Chargers,
                    cssClass: "grid__item-b",
                    url: "/"
                },
                {
                    title: "Cables",
                    imageUrl: Cables,
                    cssClass: "grid__item-c",
                    url: "/"
                },
                {
                    title: "Controllers",
                    imageUrl: Controllers,
                    cssClass: "grid__item-d",
                    url: "/"
                }
            ],
            popularProducts: [],
            loading: true,
        };
    }

    async componentDidMount() {
        if (this.props.userInfo.loggedIn) {
            await this.renderPopularProducts()
        }
        this.getRank()
    }

    async shouldComponentUpdate(nextProps) {
        if ((this.props.userInfo.loggedIn !== nextProps.userInfo.loggedIn) && nextProps.userInfo.loggedIn) {
            await this.renderPopularProducts(nextProps.userInfo.token)
        }
    }

    async getRank() {
        var categories = { categories: this.state.defaultProducts.map((product) => { return product.title }) };
        const response = await fetch("/api/personalizer/rank", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categories)
        })
        if (!response.ok || response.statusText === "No Content") {
            if (response.error) {
                console.error(response.error);
            }
            this.setState({ recommendedProducts: this.state.defaultProducts });
            return;
        } else {
            const data = await response.json();
            console.log(`Rank request sent. EventId: ${data.eventId}`);
            this.setState({ recommendedProducts: this.getRerankedProducts(data) });
        }
    }

    getRerankedProducts(data) {
        var cssEnum = ["grid__item-a", "grid__item-b", "grid__item-c", "grid__item-d"];

        var recommendSource = this.state.defaultProducts;
        var newHeroIndex = recommendSource.findIndex(obj => obj.title === data.rewardActionId);

        var newRecommend = [];
        var counter;
        for (counter = 0; counter < recommendSource.length; counter++) {
            newRecommend.push(Object.assign({}, recommendSource[counter]));
        }

        newRecommend.unshift(newRecommend.splice(newHeroIndex, 1)[0]);

        newRecommend.forEach((category, index) => {
            category.cssClass = cssEnum[index];
            category.eventId = data.eventId;
        })

        return newRecommend;
    }

    async renderPopularProducts(token) {
        token = token || this.props.userInfo.token;

        let popularProducts = await ProductService.getHomePageData(token);

        if (popularProducts && popularProducts.data.popularProducts) {
            popularProducts = popularProducts.data.popularProducts.slice(0, 3);
            this.setState({ popularProducts, loading: false });
        }
    }

    render() {
        const { recommendedProducts, popularProducts } = this.state;
        const { loggedIn } = this.props.userInfo
        return (
            <Fragment>
                <Home
                    recommendedProducts={recommendedProducts}
                    popularProducts={popularProducts}
                    loggedIn={loggedIn}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = state => state.login;

export default connect(mapStateToProps)(HomeContainer);
