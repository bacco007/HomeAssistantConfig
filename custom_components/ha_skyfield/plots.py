"""Code that makes plot."""
import matplotlib.pyplot as plt


def plot_all_sun_paths(data):
    """Show where the sun goes throughout the year."""
    fig = plt.figure()
    ax = fig.add_subplot(111, projection="polar")  # pylint: disable=invalid-name
    alts, azis = zip(*data)
    ax.scatter(azis, alts, s=10, alpha=0.5)
    ax.set_theta_zero_location("S", offset=0)
    ax.set_rmax(90)
    plt.show()
