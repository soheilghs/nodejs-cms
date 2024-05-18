const Controller =
  require('app/http/controllers/api/Controller');
const Payment = require("app/models/Payment");

class HomeController extends Controller {

  async user(req, res) {
    let user = await req.user.populate({
      path: 'roles',
      select: 'name label permissions',
      populate: [
        {
          path: 'permissions'
        }
      ]
    }).execPopulate();

    return res.json({
      data: this.filterUserData(user),
      status: 'success'
    });
  }

  async history(req, res) {
    try {
      let page = req.query.page || 1;
      let payments =
        await Payment.paginate({
          user: req.user.id
        }, {
          page,
          sort: {createdAt: -1},
          limit: 20,
          populate: [
            {
              path: 'course'
            },
            {
              path: 'user',
              select: 'name email'
            }
          ]
        });

      res.json({
        data: this.filterPaymentData(payments),
        status: 'success'
      });
    } catch (err) {
      this.failed(err.message, res);
    }
  }

  filterPaymentData(payments) {
    return {
      ...payments,
      docs: payments.docs.map(pay => {
        return {
          payed: pay.payed,
          res_number: pay.res_number,
          price: pay.price,
          user: {
            name: pay.user.name,
            email: pay.user.email
          }
        };
      })
    };
  }

  filterUserData(user) {
    return {
      id: user.id,
      admin: user.admin,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      vipTime: user.vipTime,
      vipType: user.vipType,
      roles: user.roles.map(role => {
        return {
          name: role.name,
          label: role.label,
          permissions: role.permissions.map(per => {
            return {
              name: per.name,
              label: per.label,
            }
          })
        }
      })
    };
  }
}

module.exports = new HomeController();