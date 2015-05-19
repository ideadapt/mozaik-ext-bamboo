var React            = require('react');
var Reflux           = require('reflux');
var ViewJobs         = require('./ViewJobs.jsx');
var ApiConsumerMixin = require('mozaik/browser').Mixin.ApiConsumer;

var View = React.createClass({
    mixins: [
        Reflux.ListenerMixin,
        ApiConsumerMixin
    ],

    propTypes: {
        planIds: React.PropTypes.array.isRequired
    },

    getInitialState() {
        return {
            view: null
        };
    },

    getApiRequest() {
        return {
            id: 'bamboo.plan_results.' + this.props.view,
            params: {
                planIds: this.props.planIds
            }
        };
    },

    onApiData(planIds) {
        this.setState({
            planIds: planIds
        });
    },

    render() {
        var titleNode = (
            <span>
                Bamboo <span className="widget__header__subject">{this.props.view}</span> view
            </span>
        );
        if (this.props.title) {
            titleNode = this.props.title;
        }

        var jobsNode = null;
        if (this.state.planIds) {
            
        }

        return (
            <div>

            </div>
        );
    }
});

module.exports = View;